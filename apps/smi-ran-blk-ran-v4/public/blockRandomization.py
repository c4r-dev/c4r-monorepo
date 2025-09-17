# This script generates a block randomization allocation sequence and visualizes it using a heatmap.
# It is a Python equivalent of the R script provided in the original task.
# The script includes functions to create the randomization schedule and plot the results.
# The generated plot is saved in a specified directory.

# The script uses the following libraries:
# - pandas: for data manipulation and DataFrame creation
# - matplotlib: for plotting the heatmap
# - seaborn: for enhanced visualization of the heatmap
# - numpy: for numerical operations
# - math: for mathematical operations
# - os: for file and directory operations
# - random: for randomization of treatment assignments
# pip3 install pandas matplotlib seaborn numpy 

import random
import pandas as pd
import math
import os
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

def generate_block_randomization(n_target, treatment_labels, block_size_multiplier, block_prefix="Block "):
    """
    Generates a block randomization allocation sequence.

    Args:
        n_target (int): Target total number of samples. The function will generate
                        enough full blocks to meet or exceed this number.
        treatment_labels (list): A list of strings for treatment arm names (e.g., ["Treatment", "Control"]).
        block_size_multiplier (int): The number of times each treatment arm appears within a single block.
                                     The actual block size will be block_size_multiplier * number_of_treatment_arms.
        block_prefix (str): Prefix for block names (e.g., "Block ").

    Returns:
        pandas.DataFrame: A DataFrame with the randomization schedule, including columns
                          'id', 'block.id', 'block.size', and 'treatment'.
    """
    num_treatments = len(treatment_labels)
    if num_treatments == 0:
        raise ValueError("Treatment labels cannot be empty.")
    if block_size_multiplier <= 0:
        raise ValueError("Block size multiplier must be positive.")
        
    actual_block_size = block_size_multiplier * num_treatments
    
    # Determine number of blocks: enough to cover n_target
    # This matches R's blockrand behavior which typically completes blocks
    num_blocks_to_generate = math.ceil(n_target / actual_block_size)
    if num_blocks_to_generate == 0 and n_target > 0: # handles small n_target
        num_blocks_to_generate = 1
    
    all_subjects = []
    current_id = 1
    for i in range(int(num_blocks_to_generate)):
        block_id_str = f"{block_prefix}{i + 1}"
        
        # Create treatments for the current block
        treatments_in_block = []
        for label in treatment_labels:
            treatments_in_block.extend([label] * block_size_multiplier)
        
        random.shuffle(treatments_in_block) # Randomize treatments within the block
        
        for treatment in treatments_in_block:
            all_subjects.append({
                'id': current_id,
                'block.id': block_id_str,
                'block.size': actual_block_size,
                'treatment': treatment
            })
            current_id += 1
            
    df = pd.DataFrame(all_subjects)
    
    # If n_target is not a multiple of actual_block_size, blockrand usually returns
    # more than n_target. If the user wanted exactly n_target (and it's less than generated)
    # they might truncate. For the R script's parameters n=30, actual_block_size=10,
    # this is an exact match.
    # If strict truncation to n_target is desired even if it splits a block:
    # df = df.iloc[:n_target]
    
    return df

def main():
    # Parameters from the R script
    n_total = 30  # target number of samples
    num_levels = 2 # number of treatment arms (derived from treatment_labels)
    treatment_labels = ["Treatment", "Control"] # arm names
    block_size_multiplier = 5 # R's block.sizes = c(5); each treatment appears 5 times per block
    block_prefix_str = "Block " # block names

    # Create block randomization allocation sequence
    df_block_rand = generate_block_randomization(
        n_target=n_total,
        treatment_labels=treatment_labels,
        block_size_multiplier=block_size_multiplier,
        block_prefix=block_prefix_str
    )

    # Add sequential position within each block
    df_block_rand['position_in_block'] = df_block_rand.groupby('block.id', sort=False).cumcount() + 1

    print("Generated Block Randomization Data:")
    print(df_block_rand)
    print("\n")

    # Create visualization
    # Map treatments to numerical values for heatmap coloring
    unique_treatments = df_block_rand['treatment'].unique()
    treatment_map = {label: i for i, label in enumerate(unique_treatments)}
    df_block_rand['treatment_num'] = df_block_rand['treatment'].map(treatment_map)

    # Pivot table for heatmap: y-axis as block.id, x-axis as position_in_block
    heatmap_data = df_block_rand.pivot_table(
        index='block.id', 
        columns='position_in_block', 
        values='treatment_num'
    )

    # Sort blocks for plotting consistency (e.g., "Block 1", "Block 2", ...)
    # R's ggplot used factor(block.id, levels = rev(unique(block.id)))
    # This means "Block 1" at the bottom, "Block N" at the top.
    # Seaborn heatmap plots index 0 at the top. So we want the sorted unique block.id.
    # If blocks are ["Block 1", "Block 2", "Block 3"], rev(unique) is ["Block 3", "Block 2", "Block 1"].
    # Heatmap with this index order will put "Block 3" at top.
    # To have "Block 1" at the bottom, we want the natural sort order for the index, 
    # and then ensure the y-axis is displayed inverted or labels interpreted accordingly.
    # Let's ensure blocks are naturally sorted for the pivot, then let heatmap handle display.
    
    # Natural sort for block IDs (e.g., "Block 1", "Block 2", ..., "Block 10")
    # This will be important if block numbers go into double digits.
    block_order_sorted_natural = sorted(df_block_rand['block.id'].unique(), 
                                   key=lambda x: int(x.replace(block_prefix_str, '')))
                                   
    heatmap_data = heatmap_data.reindex(block_order_sorted_natural)


    # Get corresponding 'id' values for annotations
    id_data_pivot = df_block_rand.pivot_table(
        index='block.id',
        columns='position_in_block',
        values='id'
    ).reindex(block_order_sorted_natural)

    # Create the plot
    fig, ax = plt.subplots(figsize=(10, max(4, len(heatmap_data.index) * 0.6))) # Dynamic height
    
    # Choose colors similar to R's Set1
    # Ensure enough colors if more than 2 treatments
    palette_colors = sns.color_palette("Set1", n_colors=len(unique_treatments)) 

    sns.heatmap(
        heatmap_data,
        ax=ax,
        cmap=palette_colors,
        linewidths=2, # Creates separation similar to R's geom_tile color="gray30"
        linecolor='white', # Color of the lines between cells
        cbar=False, # R plot uses a legend, not a colorbar attached to heatmap
        square=False, # geom_tile is not necessarily square
        annot=False # Custom annotations will be added
    )

    # Add text annotations (subject IDs) onto the heatmap cells
    for r_idx, block_name in enumerate(heatmap_data.index):
        for c_idx, pos_in_block in enumerate(heatmap_data.columns):
            # Ensure we don't try to access out-of-bounds if pivot created NaNs
            if pd.notna(heatmap_data.iloc[r_idx, c_idx]) and pd.notna(id_data_pivot.iloc[r_idx, c_idx]):
                subject_id = int(id_data_pivot.iloc[r_idx, c_idx])
                ax.text(
                    c_idx + 0.5,  # x-coordinate (center of cell)
                    r_idx + 0.5,  # y-coordinate (center of cell)
                    str(subject_id),
                    ha='center',
                    va='center',
                    color='white' if sum(palette_colors[int(heatmap_data.iloc[r_idx, c_idx])][:3]) < 1.5 else 'black', # Contrast
                    fontsize=10 
                )

    # Create a custom legend similar to R's scale_fill_brewer
    legend_patches = [plt.Rectangle((0,0),1,1, color=palette_colors[i]) for i in range(len(unique_treatments))]
    ax.legend(legend_patches, unique_treatments, title="Treatment", bbox_to_anchor=(1.02, 1), loc='upper left')

    # Labels and Title
    num_unique_blocks = len(df_block_rand['block.id'].unique())
    # Assuming fixed block size for subtitle, as in R script's example
    samples_per_block = df_block_rand['block.size'].unique()[0] 
    num_unique_treatments = len(df_block_rand['treatment'].unique())

    plot_title = "Block randomization of samples by block"
    plot_subtitle = (
        f"{num_unique_blocks} blocks with {samples_per_block} "
        f"samples per block, randomized to {num_unique_treatments} treatments"
    )
    
    fig.suptitle(plot_title, fontsize=14, y=0.98) # Adjust y for suptitle
    ax.set_title(plot_subtitle, fontsize=10, pad=10)

    ax.set_xlabel("Treatment sequence within block")
    ax.set_ylabel("Block")
    
    # Invert y-axis to have Block 1 at the bottom (more conventional for this type of plot)
    ax.invert_yaxis()


    # Theme adjustments to mimic R's theme_minimal + customizations
    ax.tick_params(axis='x', which='both', bottom=False, top=False, labelbottom=False) # Remove x-axis text and ticks
    ax.tick_params(axis='y', which='both', left=True) # Keep y-axis ticks and labels
    
    # Remove grid lines from seaborn heatmap default
    ax.grid(False) 
    
    plt.tight_layout(rect=[0, 0, 0.88, 0.96]) # Adjust layout for legend and titles

    # Save the plot
    plots_dir = "plots_py" # Using a different directory name
    if not os.path.exists(plots_dir):
        os.makedirs(plots_dir)
        print(f"Created directory: {plots_dir}")

    plot_basename = "01_block-randomization_py"
    png_filename = os.path.join(plots_dir, f"{plot_basename}.png")
    svg_filename = os.path.join(plots_dir, f"{plot_basename}.svg")

    plt.savefig(png_filename, dpi=400, bbox_inches='tight')
    plt.savefig(svg_filename, dpi=400, bbox_inches='tight')
    print(f"Plot saved to {png_filename}")
    print(f"Plot saved to {svg_filename}")

    # To display the plot if running interactively (optional)
    # plt.show() 

if __name__ == "__main__":
    main()