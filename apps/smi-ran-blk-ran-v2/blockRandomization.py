import numpy as np

def assign_to_treatment(K):
    # Create a zeros vector of length K to represent the untreated
    untreated = np.zeros(K)
    
    # Create a ones vector of length K to represent the treated
    treated = np.ones(K)
    
    # Concatenate the two vectors to produce a joint population
    overall_population = np.concatenate((treated, untreated))
    
    # Randomly permute who is in which group
    assignment = np.random.permutation(overall_population)
    
    return assignment

# Example usage === instead use existing graphic
K = 6
result = assign_to_treatment(K)
print(result)

# [0. 1. 1. 0. 1. 1. 0. 0. 1. 1. 0. 0.]