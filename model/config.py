
class GPTConfig:
    """
    Central configuration for ASTRA model
    This is the single source of truth for model + training parameters
    """

    def __init__(
        self,
        vocab_size,
        
        # ------------------ MODEL ------------------
        block_size=128,      # smaller = faster training
        n_embd=128,          # embedding size
        n_layer=4,           # number of transformer blocks
        n_head=4,            # attention heads
        dropout=0.1,

        # ------------------ TRAINING ------------------
        batch_size=16,
        learning_rate=5e-4,
        epochs=10,

        # ------------------ SYSTEM ------------------
        device="cuda"
    ):
        # Core
        self.vocab_size = vocab_size
        self.block_size = block_size

        # Model architecture
        self.n_embd = n_embd
        self.n_layer = n_layer
        self.n_head = n_head
        self.dropout = dropout

        # Training
        self.batch_size = batch_size
        self.learning_rate = learning_rate
        self.epochs = epochs

        # Device
        self.device = device

    def __repr__(self):
        return (
            f"GPTConfig("
            f"vocab_size={self.vocab_size}, "
            f"block_size={self.block_size}, "
            f"n_embd={self.n_embd}, "
            f"n_layer={self.n_layer}, "
            f"n_head={self.n_head}, "
            f"batch_size={self.batch_size}, "
            f"lr={self.learning_rate}, "
            f"epochs={self.epochs})"
        )

