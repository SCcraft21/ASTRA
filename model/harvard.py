import torch
import torch.nn as nn
import torch.nn.functional as F


# =====================================================================
#  HARVARD DUAL-MEMORY ARCHITECTURE FOR ASTRA
# =====================================================================
#
#  Inspired by the Harvard CPU architecture which uses separate memory
#  buses for instructions and data, this neural architecture maintains
#  two parallel processing streams:
#
#    1. Instruction Memory Bank  — learned "program ROM" embeddings
#       processed through self-attention to refine instruction knowledge
#
#    2. Data Memory Path         — standard causal self-attention over
#       input token embeddings (the "data bus")
#
#  Both paths converge in a Cross-Attention Merge Layer where the data
#  path queries the instruction bank, then a learnable gating scalar
#  fuses the two streams before passing into standard decoder blocks.
#
# =====================================================================


# ------------------ INSTRUCTION SELF-ATTENTION ------------------
class InstructionSelfAttention(nn.Module):
    """Multi-head self-attention within the instruction memory bank.
    No causal mask — instruction slots can attend to all other slots."""

    def __init__(self, n_embd, n_head, dropout):
        super().__init__()

        self.n_head = n_head
        self.head_dim = n_embd // n_head

        self.qkv = nn.Linear(n_embd, 3 * n_embd)
        self.proj = nn.Linear(n_embd, n_embd)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        B, S, C = x.size()

        qkv = self.qkv(x)
        q, k, v = qkv.split(C, dim=2)

        q = q.view(B, S, self.n_head, self.head_dim).transpose(1, 2)
        k = k.view(B, S, self.n_head, self.head_dim).transpose(1, 2)
        v = v.view(B, S, self.n_head, self.head_dim).transpose(1, 2)

        # Full (non-causal) attention — instruction slots see everything
        att = (q @ k.transpose(-2, -1)) / (self.head_dim ** 0.5)
        att = F.softmax(att, dim=-1)
        att = self.dropout(att)

        out = att @ v
        out = out.transpose(1, 2).contiguous().view(B, S, C)

        return self.proj(out)


# ------------------ INSTRUCTION MEMORY BANK ------------------
class InstructionMemoryBank(nn.Module):
    """
    The 'Instruction Bus' of the Harvard architecture.
    
    Maintains a bank of learned instruction embeddings (nn.Parameter)
    that act as a persistent "program ROM" — storing task patterns,
    syntax rules, and generation strategies learned during training.
    
    These are refined through self-attention layers so instruction
    slots can develop specialized roles (e.g., grammar rules,
    domain knowledge patterns, formatting templates).
    """

    def __init__(self, config):
        super().__init__()

        n_embd = config.n_embd
        n_inst = config.n_inst
        n_inst_layers = config.n_inst_layers

        # Learned instruction embeddings — the "program ROM"
        self.instruction_bank = nn.Parameter(
            torch.randn(1, n_inst, n_embd) * 0.02
        )

        # Self-attention layers to refine instruction representations
        self.layers = nn.ModuleList()
        for _ in range(n_inst_layers):
            self.layers.append(nn.ModuleDict({
                'ln1': nn.LayerNorm(n_embd),
                'attn': InstructionSelfAttention(n_embd, config.n_head, config.dropout),
                'ln2': nn.LayerNorm(n_embd),
                'ffn': nn.Sequential(
                    nn.Linear(n_embd, 4 * n_embd),
                    nn.GELU(),
                    nn.Linear(4 * n_embd, n_embd),
                    nn.Dropout(config.dropout),
                ),
            }))

    def forward(self, batch_size):
        """Returns refined instruction embeddings, expanded to batch size.
        
        Args:
            batch_size: Number of sequences in the current batch.
            
        Returns:
            Tensor of shape (B, n_inst, n_embd) — refined instruction features.
        """
        # Expand learned bank across the batch
        x = self.instruction_bank.expand(batch_size, -1, -1)

        # Refine through self-attention layers
        for layer in self.layers:
            x = x + layer['attn'](layer['ln1'](x))
            x = x + layer['ffn'](layer['ln2'](x))

        return x


# ------------------ DATA SELF-ATTENTION (CAUSAL) ------------------
class DataCausalSelfAttention(nn.Module):
    """Multi-head causal self-attention for the data memory path.
    Uses a triangular causal mask to enforce autoregressive ordering."""

    def __init__(self, n_embd, n_head, dropout):
        super().__init__()

        self.n_head = n_head
        self.head_dim = n_embd // n_head

        self.qkv = nn.Linear(n_embd, 3 * n_embd)
        self.proj = nn.Linear(n_embd, n_embd)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        B, T, C = x.size()

        qkv = self.qkv(x)
        q, k, v = qkv.split(C, dim=2)

        q = q.view(B, T, self.n_head, self.head_dim).transpose(1, 2)
        k = k.view(B, T, self.n_head, self.head_dim).transpose(1, 2)
        v = v.view(B, T, self.n_head, self.head_dim).transpose(1, 2)

        # Causal mask — data path is strictly autoregressive
        att = (q @ k.transpose(-2, -1)) / (self.head_dim ** 0.5)
        mask = torch.tril(torch.ones(T, T, device=x.device))
        att = att.masked_fill(mask == 0, float("-inf"))
        att = F.softmax(att, dim=-1)
        att = self.dropout(att)

        out = att @ v
        out = out.transpose(1, 2).contiguous().view(B, T, C)

        return self.proj(out)


# ------------------ DATA MEMORY PATH ------------------
class DataMemoryPath(nn.Module):
    """
    The 'Data Bus' of the Harvard architecture.
    
    Processes input token embeddings through causal self-attention
    layers. This is the standard autoregressive data processing
    path — similar to a conventional transformer's early layers,
    but isolated as a dedicated data-only stream.
    """

    def __init__(self, config):
        super().__init__()

        n_embd = config.n_embd
        n_data_layers = config.n_data_layers

        self.layers = nn.ModuleList()
        for _ in range(n_data_layers):
            self.layers.append(nn.ModuleDict({
                'ln1': nn.LayerNorm(n_embd),
                'attn': DataCausalSelfAttention(n_embd, config.n_head, config.dropout),
                'ln2': nn.LayerNorm(n_embd),
                'ffn': nn.Sequential(
                    nn.Linear(n_embd, 4 * n_embd),
                    nn.GELU(),
                    nn.Linear(4 * n_embd, n_embd),
                    nn.Dropout(config.dropout),
                ),
            }))

    def forward(self, x):
        """Processes data embeddings through causal self-attention.
        
        Args:
            x: Token embeddings of shape (B, T, n_embd).
            
        Returns:
            Tensor of shape (B, T, n_embd) — refined data features.
        """
        for layer in self.layers:
            x = x + layer['attn'](layer['ln1'](x))
            x = x + layer['ffn'](layer['ln2'](x))

        return x


# ------------------ HARVARD MERGE LAYER ------------------
class HarvardMergeLayer(nn.Module):
    """
    The convergence point where instruction and data buses merge.
    
    Uses cross-attention where the data path acts as QUERIES and
    the instruction bank acts as KEYS/VALUES. This allows each
    data token position to selectively retrieve relevant "program
    instructions" from the instruction memory.
    
    A learnable gating scalar α controls the blend ratio:
        output = α * instruction_attended + (1 - α) * data_features
    
    This lets the model learn how much to rely on its learned
    instruction patterns vs. the raw input data at each position.
    """

    def __init__(self, config):
        super().__init__()

        n_embd = config.n_embd
        n_merge_heads = config.n_merge_heads
        self.n_head = n_merge_heads
        self.head_dim = n_embd // n_merge_heads

        # Cross-attention projections
        self.q_proj = nn.Linear(n_embd, n_embd)   # Data → Queries
        self.k_proj = nn.Linear(n_embd, n_embd)   # Instructions → Keys
        self.v_proj = nn.Linear(n_embd, n_embd)   # Instructions → Values
        self.out_proj = nn.Linear(n_embd, n_embd)

        self.dropout = nn.Dropout(config.dropout)

        # LayerNorms for the cross-attention inputs
        self.ln_data = nn.LayerNorm(n_embd)
        self.ln_inst = nn.LayerNorm(n_embd)

        # Learnable gating parameter (initialized at 0.5 → sigmoid = 0.62)
        # The model learns whether to lean toward instructions or data
        self.gate_logit = nn.Parameter(torch.tensor(0.5))

    def forward(self, data_features, instruction_features):
        """Merge data and instruction streams via cross-attention + gating.
        
        Args:
            data_features: (B, T, n_embd) — output of DataMemoryPath
            instruction_features: (B, n_inst, n_embd) — output of InstructionMemoryBank
            
        Returns:
            Tensor of shape (B, T, n_embd) — fused representation.
        """
        B, T, C = data_features.size()
        S = instruction_features.size(1)  # n_inst

        # LayerNorm before cross-attention
        data_normed = self.ln_data(data_features)
        inst_normed = self.ln_inst(instruction_features)

        # Project: data → queries, instructions → keys/values
        q = self.q_proj(data_normed)
        k = self.k_proj(inst_normed)
        v = self.v_proj(inst_normed)

        # Reshape for multi-head attention
        q = q.view(B, T, self.n_head, self.head_dim).transpose(1, 2)  # (B, H, T, D)
        k = k.view(B, S, self.n_head, self.head_dim).transpose(1, 2)  # (B, H, S, D)
        v = v.view(B, S, self.n_head, self.head_dim).transpose(1, 2)  # (B, H, S, D)

        # Cross-attention: data queries instruction memory
        # No causal mask needed — data can attend to all instruction slots
        att = (q @ k.transpose(-2, -1)) / (self.head_dim ** 0.5)
        att = F.softmax(att, dim=-1)
        att = self.dropout(att)

        # Attended instruction features (projected back to data's sequence length)
        inst_attended = att @ v  # (B, H, T, D)
        inst_attended = inst_attended.transpose(1, 2).contiguous().view(B, T, C)
        inst_attended = self.out_proj(inst_attended)

        # Learnable gating: α ∈ (0, 1)
        alpha = torch.sigmoid(self.gate_logit)

        # Fused output: blend instruction-attended features with raw data
        fused = alpha * inst_attended + (1.0 - alpha) * data_features

        return fused


# ------------------ STANDARD DECODER BLOCK ------------------
class DecoderBlock(nn.Module):
    """Standard transformer decoder block with causal self-attention + FFN.
    Used in the decoder stack after the Harvard merge layer."""

    def __init__(self, config):
        super().__init__()

        self.ln1 = nn.LayerNorm(config.n_embd)
        self.ln2 = nn.LayerNorm(config.n_embd)

        self.attn = DataCausalSelfAttention(config.n_embd, config.n_head, config.dropout)
        self.ffn = nn.Sequential(
            nn.Linear(config.n_embd, 4 * config.n_embd),
            nn.GELU(),
            nn.Linear(4 * config.n_embd, config.n_embd),
            nn.Dropout(config.dropout),
        )

    def forward(self, x):
        x = x + self.attn(self.ln1(x))
        x = x + self.ffn(self.ln2(x))
        return x


# =====================================================================
#  HARVARD GPT — TOP-LEVEL MODEL
# =====================================================================

class HarvardGPT(nn.Module):
    """
    Harvard Dual-Memory GPT Model for ASTRA.
    
    Architecture flow:
        1. Token + Position Embeddings
        2. PARALLEL:
           a. InstructionMemoryBank — learned program embeddings + self-attention
           b. DataMemoryPath — causal self-attention over token embeddings
        3. HarvardMergeLayer — cross-attention gating fusion
        4. Decoder stack — standard autoregressive transformer blocks
        5. Final LayerNorm + linear head → logits
    
    This separates "what the model has learned to do" (instructions)
    from "what the model is currently processing" (data), allowing
    each stream to be independently optimized before convergence.
    """

    def __init__(self, config):
        super().__init__()

        self.config = config

        # ---- Shared embeddings ----
        self.token_embedding = nn.Embedding(config.vocab_size, config.n_embd)
        self.position_embedding = nn.Embedding(config.block_size, config.n_embd)

        # ---- Harvard dual-memory paths (PARALLEL) ----
        self.instruction_memory = InstructionMemoryBank(config)
        self.data_memory = DataMemoryPath(config)

        # ---- Merge layer (CONVERGENCE) ----
        self.merge = HarvardMergeLayer(config)

        # ---- Standard decoder stack ----
        self.decoder_blocks = nn.ModuleList(
            [DecoderBlock(config) for _ in range(config.n_layer)]
        )

        # ---- Output head ----
        self.ln_f = nn.LayerNorm(config.n_embd)
        self.lm_head = nn.Linear(config.n_embd, config.vocab_size)

        # ---- Weight initialization ----
        self.apply(self._init_weights)

        # Apply special scaled init to residual projections
        for pn, p in self.named_parameters():
            if pn.endswith('proj.weight') or pn.endswith('out_proj.weight'):
                torch.nn.init.normal_(
                    p, mean=0.0,
                    std=0.02 / (2 * config.n_layer) ** 0.5
                )
            # Scale down FFN output projections in decoder blocks
            if '.ffn.2.weight' in pn and 'decoder_blocks' in pn:
                torch.nn.init.normal_(
                    p, mean=0.0,
                    std=0.02 / (2 * config.n_layer) ** 0.5
                )

    def _init_weights(self, module):
        if isinstance(module, nn.Linear):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                torch.nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
        elif isinstance(module, nn.LayerNorm):
            torch.nn.init.zeros_(module.bias)
            torch.nn.init.ones_(module.weight)

    def forward(self, idx):
        """
        Forward pass through the Harvard dual-memory architecture.
        
        Args:
            idx: Token indices of shape (B, T).
            
        Returns:
            Logits of shape (B, T, vocab_size).
        """
        B, T = idx.size()

        # ---- Embeddings ----
        pos = torch.arange(0, T, device=idx.device).unsqueeze(0)
        tok_emb = self.token_embedding(idx)
        pos_emb = self.position_embedding(pos)
        x = tok_emb + pos_emb

        # ---- PARALLEL: Dual-memory processing ----
        # Path 1: Instruction memory (independent of input data)
        instruction_features = self.instruction_memory(B)

        # Path 2: Data memory (processes input token embeddings)
        data_features = self.data_memory(x)

        # ---- CONVERGENCE: Merge both paths ----
        x = self.merge(data_features, instruction_features)

        # ---- Autoregressive decoder stack ----
        for block in self.decoder_blocks:
            x = block(x)

        # ---- Output ----
        x = self.ln_f(x)
        logits = self.lm_head(x)

        return logits
