import torch
import numpy as np
from torch.utils.data import Dataset

class TextDataset(Dataset):
    def __init__(self, data_path, context_length):
        data = np.load(data_path)
        self.data = torch.tensor(data, dtype=torch.long)
        self.context_length = context_length

    def __len__(self):
        return len(self.data) - self.context_length

    def __getitem__(self, idx):
        x = self.data[idx:idx+self.context_length]
        y = self.data[idx+1:idx+self.context_length+1]
        return x, y