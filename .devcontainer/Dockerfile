# Use Microsoft's devcontainer base image with .NET
FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Install zsh and make it the default shell
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends zsh \
    && chsh -s /bin/zsh vscode

# Set up user
USER vscode

# Configure zsh for vscode user
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

USER root

# Install additional tools that might be needed
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    curl \
    wget \
    git \
    build-essential \
    libssl-dev \
    ca-certificates \
    && apt-get autoremove -y && apt-get clean -y

# Install uv for Python package management
RUN curl -LsSf https://astral.sh/uv/install.sh | sh \
    && ln -s /root/.cargo/bin/uv /usr/local/bin/uv

USER vscode

# Also install uv for vscode user
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Add uv to PATH for vscode user
ENV PATH="/home/vscode/.cargo/bin:${PATH}"

USER root
