FROM php:8.2-cli

WORKDIR /var/www

RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    libzip-dev \
    libpq-dev \
    libxml2-dev \
    libonig-dev \
    libcurl4-openssl-dev \
    pkg-config \
    && docker-php-ext-install \
    pdo \
    pdo_pgsql \
    zip \
    xml \
    mbstring \
    curl

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY . .

RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --prefer-dist \
    --no-progress

EXPOSE 10000

CMD php artisan serve --host=0.0.0.0 --port=10000