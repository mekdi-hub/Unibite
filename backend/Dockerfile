FROM php:8.2-cli

WORKDIR /var/www

# =========================
# System dependencies
# =========================
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    zip \
    libzip-dev \
    libpq-dev \
    libxml2-dev \
    libonig-dev \
    libcurl4-openssl-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# =========================
# PHP extensions
# =========================
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    mbstring \
    xml \
    zip \
    curl

# =========================
# Composer
# =========================
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# =========================
# Copy project files
# =========================
COPY . .

# =========================
# Install dependencies
# =========================
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --optimize-autoloader

# =========================
# Expose port
# =========================
EXPOSE 10000

# =========================
# Start Laravel
# =========================
CMD php artisan serve --host=0.0.0.0 --port=10000