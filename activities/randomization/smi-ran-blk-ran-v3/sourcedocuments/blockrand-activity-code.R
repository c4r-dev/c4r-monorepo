# Install required packages
installed.packages("blockrand", "tidyverse")

# Load required packages
library(blockrand)
library(tidyverse)

# Create block randomization allocation sequence using blockrand package
block_rand <- blockrand(n = 30, # target number of samples
                        num.levels = 2, # number of treatment arms
                        levels = c("Treatment", "Control"), # arm names
                        block.sizes = c(5), # times arms for fixed block
                        block.prefix = "Block ") # block names

# Add sequential position within each block
block_rand <- block_rand %>%
  group_by(block.id) %>%
  mutate(position_in_block = row_number()) %>%
  ungroup()

# Create visualization of the block randomization
ggplot(block_rand, aes(x = position_in_block, y = factor(block.id, levels = rev(unique(block.id))))) + 
  geom_tile(aes(fill = treatment), color = 'gray30', width = 0.9, height = 0.9) + 
  geom_text(aes(label = id), color = "black", size = 3) +
  scale_fill_brewer(palette = "Set1", name = "Treatment") +
  labs(title = "Block randomization of samples by block",
       subtitle = paste(length(unique(block_rand$block.id)), "blocks with", 
                        unique(block_rand$block.size), 
                        "samples per block, randomized to", 
                        length(unique(block_rand$treatment)), "treatments"),
       x = "Treatment sequence", y = "Block") +  # Removed x-axis label
  theme_minimal() +
  theme(
    panel.grid = element_blank(),
    axis.text.x = element_blank(),  # Remove x-axis text
    axis.ticks.x = element_blank()  # Remove x-axis ticks
  )

ggsave("plots/01_block-randomization.png", width = 8, height = 4, dpi = 400)
ggsave("plots/01_block-randomization.svg", width = 8, height = 4, dpi = 400)