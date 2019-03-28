args <- commandArgs(trailingOnly=TRUE)
path <- args[2]
output_format <- args[1]
rmarkdown::render_site(input = path, output_format = output_format, encoding = 'UTF-8')