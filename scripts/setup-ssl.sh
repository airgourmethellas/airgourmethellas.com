#!/bin/bash
# SSL Certificate Setup Script for Air Gourmet Hellas
# This script should be run by administrators to set up SSL certificates
# for the www.airgourmethellas.com domain

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default paths
SSL_DIR="/etc/ssl"
PRIVATE_KEY_PATH="${SSL_DIR}/private/airgourmethellas.key"
CERT_PATH="${SSL_DIR}/certs/airgourmethellas.crt"
ENV_FILE="./.env"

# Check if running with sudo
if [ "$EUID" -ne 0 ]
  then echo -e "${RED}Please run as root or with sudo${NC}"
  exit 1
fi

# Create SSL directories if they don't exist
mkdir -p "${SSL_DIR}/private"
mkdir -p "${SSL_DIR}/certs"

echo -e "${YELLOW}Air Gourmet Hellas SSL Certificate Setup${NC}"
echo "This script will help you set up SSL certificates for www.airgourmethellas.com"
echo ""

# Ask for certificate method
echo "How do you want to set up SSL certificates?"
echo "1) Use Let's Encrypt (Recommended for production)"
echo "2) Generate self-signed certificate (Testing only)"
echo "3) Manually provide existing certificate files"
read -p "Enter your choice (1-3): " ssl_method

case $ssl_method in
  1)
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
      echo -e "${YELLOW}Certbot not found. Installing...${NC}"
      apt-get update
      apt-get install -y certbot
    fi
    
    # Get certificate using Let's Encrypt
    echo -e "${YELLOW}Obtaining certificate from Let's Encrypt...${NC}"
    certbot certonly --standalone -d airgourmethellas.com -d www.airgourmethellas.com
    
    # Link certificates to our expected locations
    echo -e "${YELLOW}Linking certificates to expected locations...${NC}"
    ln -sf /etc/letsencrypt/live/www.airgourmethellas.com/privkey.pem "${PRIVATE_KEY_PATH}"
    ln -sf /etc/letsencrypt/live/www.airgourmethellas.com/fullchain.pem "${CERT_PATH}"
    ;;
    
  2)
    # Generate self-signed certificate
    echo -e "${YELLOW}Generating self-signed certificate...${NC}"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout "${PRIVATE_KEY_PATH}" -out "${CERT_PATH}" \
      -subj "/C=GR/ST=Thessaloniki/L=Thessaloniki/O=Air Gourmet Hellas/OU=IT/CN=www.airgourmethellas.com"
    ;;
    
  3)
    # Manual certificate setup
    read -p "Enter path to private key file: " key_path
    read -p "Enter path to certificate file: " cert_path
    
    if [ ! -f "$key_path" ] || [ ! -f "$cert_path" ]; then
      echo -e "${RED}One or both files not found. Aborting.${NC}"
      exit 1
    fi
    
    # Copy files to expected locations
    cp "$key_path" "${PRIVATE_KEY_PATH}"
    cp "$cert_path" "${CERT_PATH}"
    ;;
    
  *)
    echo -e "${RED}Invalid option. Exiting.${NC}"
    exit 1
    ;;
esac

# Set proper permissions
chmod 600 "${PRIVATE_KEY_PATH}"
chmod 644 "${CERT_PATH}"

# Update environment variables
echo -e "${YELLOW}Updating environment variables...${NC}"

# Create .env file if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
  touch "$ENV_FILE"
fi

# Update SSL settings in .env
grep -v "SSL_KEY_PATH\|SSL_CERT_PATH\|CUSTOM_DOMAIN" "$ENV_FILE" > "$ENV_FILE.tmp"
echo "SSL_KEY_PATH=${PRIVATE_KEY_PATH}" >> "$ENV_FILE.tmp"
echo "SSL_CERT_PATH=${CERT_PATH}" >> "$ENV_FILE.tmp"
echo "CUSTOM_DOMAIN=true" >> "$ENV_FILE.tmp"
mv "$ENV_FILE.tmp" "$ENV_FILE"

echo -e "${GREEN}SSL setup complete!${NC}"
echo "Private key: ${PRIVATE_KEY_PATH}"
echo "Certificate: ${CERT_PATH}"
echo ""
echo -e "${YELLOW}Please ensure your server has ports 80 and 443 open.${NC}"
echo -e "${YELLOW}Restart your application for the changes to take effect.${NC}"