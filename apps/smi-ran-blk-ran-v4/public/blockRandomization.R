# Install required packages
# Specify a CRAN mirror and conform to lintr style suggestions
install.packages(
  c("blockrand", "tidyverse"),
  repos = "https://cloud.r-project.org/" # Use spaces around = and double quotes
)

# Load required packages
library(blockrand)
library(tidyverse)

# Create block randomization allocation sequence using blockrand package
block_rand <- blockrand(
  n = 30, # target number of samples
  num.levels = 2, # number of treatment arms
  levels = c("Treatment", "Control"), # arm names
  block.sizes = c(5), # times arms for fixed block
  block.prefix = "Block " # block names
)

# Add sequential position within each block
block_rand <- block_rand %>%
  group_by(block.id) %>%
  mutate(position_in_block = row_number()) %>%
  ungroup()

# Create visualization of the block randomization
p <- ggplot(
  block_rand,
  # Breaking aes mapping over multiple lines
  aes(
    x = position_in_block,
    y = factor(block.id, levels = rev(unique(block.id)))
  )
) +
  geom_tile(
    aes(fill = treatment), color = "gray30", width = 0.9, height = 0.9
  ) +
  geom_text(aes(label = id), color = "black", size = 3) +
  scale_fill_brewer(palette = "Set1", name = "Treatment") +
  labs(
    title = "Block randomization of samples by block",
    # Breaking subtitle line further
    subtitle = paste(
      length(unique(block_rand$block.id)), "blocks with",
      unique(block_rand$block.size), # Moved to separate line
      "samples per block,",
      "randomized to", length(unique(block_rand$treatment)), "treatments"
    ),
    x = "Treatment sequence", y = "Block"
  ) +
  theme_minimal() +
  theme(
    panel.grid = element_blank(),
    axis.text.x = element_blank(), # Remove x-axis text
    axis.ticks.x = element_blank() # Remove x-axis ticks
  )

# Save the plot (make sure the 'plots' directory exists)
# Creating the directory if it doesn't exist
if (!dir.exists("plots")) {
  dir.create("plots")
}

# Breaking ggsave lines
ggsave(
  filename = "plots/01_block-randomization.png",
  plot = p,
  width = 8, height = 4, dpi = 400
)
ggsave(
  filename = "plots/01_block-randomization.svg",
  plot = p,
  width = 8, height = 4, dpi = 400
)