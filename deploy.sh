#!/bin/bash

# QuizExam Docker Deployment Script
# This script deploys the QuizExam application using Docker Compose

set -e

echo "🚀 Starting QuizExam Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if required ports are available
check_ports() {
    print_status "Checking if required ports are available..."
    
    ports=(80 3307 8080)
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Port $port is already in use. Please stop the service using this port or change the port in docker-compose.yml"
        else
            print_success "Port $port is available"
        fi
    done
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p nginx/ssl
    mkdir -p logs
    
    print_success "Directories created"
}

# Build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Stop existing containers if any
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Build and start services
    docker-compose up --build -d
    
    print_success "Services started successfully"
}

# Wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be healthy..."
    
    # Wait for MySQL
    print_status "Waiting for MySQL to be ready..."
    timeout 60 bash -c 'until docker-compose exec mysql mysqladmin ping -h localhost --silent; do sleep 2; done'
    print_success "MySQL is ready"
    
    # Wait for Backend
    print_status "Waiting for Backend to be ready..."
    timeout 120 bash -c 'until curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; do sleep 5; done'
    print_success "Backend is ready"
    
    # Wait for Frontend
    print_status "Waiting for Frontend to be ready..."
    timeout 60 bash -c 'until curl -f http://localhost:80/health >/dev/null 2>&1; do sleep 5; done'
    print_success "Frontend is ready"
}

# Show deployment status
show_status() {
    print_status "Deployment Status:"
    echo ""
    docker-compose ps
    echo ""
    print_success "🎉 QuizExam has been deployed successfully!"
    echo ""
    echo "📋 Access URLs:"
    echo "   Frontend: http://localhost"
    echo "   Backend API: http://localhost:8080"
    echo "   MySQL: localhost:3307"
    echo ""
    echo "📊 Useful Commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart services: docker-compose restart"
    echo "   Update services: docker-compose up --build -d"
    echo ""
}

# Main deployment function
main() {
    print_status "Starting QuizExam deployment process..."
    
    check_docker
    check_ports
    create_directories
    deploy_services
    wait_for_services
    show_status
}

# Handle script arguments
case "${1:-}" in
    "stop")
        print_status "Stopping QuizExam services..."
        docker-compose down
        print_success "Services stopped"
        ;;
    "restart")
        print_status "Restarting QuizExam services..."
        docker-compose restart
        print_success "Services restarted"
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "status")
        docker-compose ps
        ;;
    "update")
        print_status "Updating QuizExam services..."
        docker-compose down
        docker-compose up --build -d
        wait_for_services
        show_status
        ;;
    *)
        main
        ;;
esac
