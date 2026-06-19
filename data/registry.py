DATASET_REGISTRY = {}

def register_dataset(name):
    def decorator(func):
        DATASET_REGISTRY[name] = func
        return func
    return decorator


def build_dataset(name, *args, **kwargs):
    if name not in DATASET_REGISTRY:
        raise ValueError(f"Dataset '{name}' not registered.")
    
    return DATASET_REGISTRY[name](*args, **kwargs)