# QuizExam Docker Deployment Guide

Hướng dẫn deploy hệ thống QuizExam sử dụng Docker trên Ubuntu.

## 📋 Yêu cầu hệ thống

- **Ubuntu 18.04+** (hoặc các distro Linux khác)
- **Docker 20.10+**
- **Docker Compose 2.0+**
- **RAM**: Tối thiểu 4GB (khuyến nghị 8GB)
- **Disk**: Tối thiểu 10GB trống

## 🚀 Cài đặt Docker

### 1. Cập nhật hệ thống

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Cài đặt Docker

```bash
# Cài đặt dependencies
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Thêm Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Thêm Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Cài đặt Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Thêm user vào docker group
sudo usermod -aG docker $USER

# Khởi động Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

### 3. Cài đặt Docker Compose

```bash
# Tải Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Cấp quyền thực thi
sudo chmod +x /usr/local/bin/docker-compose

# Tạo symlink
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

### 4. Khởi động lại terminal

```bash
# Logout và login lại để áp dụng group changes
exit
# Hoặc chạy:
newgrp docker
```

## 📦 Deploy QuizExam

### 1. Clone hoặc tải project

```bash
# Nếu bạn đã có project
cd /path/to/QuizExam-main

# Hoặc clone từ repository
git clone <repository-url>
cd QuizExam-main
```

### 2. Cấp quyền thực thi cho script deploy

```bash
chmod +x deploy.sh
```

### 3. Chạy deployment

```bash
# Deploy toàn bộ hệ thống
./deploy.sh

# Hoặc chạy từng bước:
docker-compose up --build -d
```

## 🔧 Quản lý Services

### Các lệnh hữu ích:

```bash
# Xem trạng thái services
./deploy.sh status
# hoặc
docker-compose ps

# Xem logs
./deploy.sh logs
# hoặc
docker-compose logs -f

# Dừng services
./deploy.sh stop
# hoặc
docker-compose down

# Khởi động lại services
./deploy.sh restart
# hoặc
docker-compose restart

# Cập nhật services
./deploy.sh update
# hoặc
docker-compose up --build -d
```

### Xem logs của từng service:

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# MySQL logs
docker-compose logs -f mysql
```

## 🌐 Truy cập ứng dụng

Sau khi deploy thành công:

- **Frontend**: http://localhost hoặc http://your-server-ip
- **Backend API**: http://localhost:8080 hoặc http://your-server-ip:8080
- **MySQL**: localhost:3306 (từ bên ngoài server)

## 🗄️ Database

### Thông tin kết nối MySQL:

- **Host**: localhost (từ bên ngoài) hoặc mysql (từ container)
- **Port**: 3306
- **Database**: quiz
- **Username**: root
- **Password**: lht@39412990

### Backup database:

```bash
# Backup
docker-compose exec mysql mysqldump -u root -plht@39412990 quiz > backup.sql

# Restore
docker-compose exec -T mysql mysql -u root -plht@39412990 quiz < backup.sql
```

## 🔒 Bảo mật (Production)

### 1. Thay đổi mật khẩu mặc định

Chỉnh sửa file `docker-compose.yml`:

```yaml
environment:
  MYSQL_ROOT_PASSWORD: your-secure-password
  MYSQL_PASSWORD: your-secure-password
```

### 2. Sử dụng SSL/TLS

```bash
# Tạo SSL certificates
mkdir -p nginx/ssl
# Copy certificates vào nginx/ssl/
# Uncomment nginx-proxy service trong docker-compose.yml
```

### 3. Firewall

```bash
# Chỉ mở các port cần thiết
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 🐛 Troubleshooting

### 1. Port đã được sử dụng

```bash
# Kiểm tra port đang sử dụng
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :3306
sudo netstat -tulpn | grep :8080

# Dừng service đang sử dụng port
sudo systemctl stop apache2  # nếu Apache đang chạy
sudo systemctl stop nginx    # nếu Nginx đang chạy
```

### 2. Không đủ RAM

```bash
# Kiểm tra RAM
free -h

# Tăng swap nếu cần
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 3. Container không khởi động

```bash
# Xem logs chi tiết
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql

# Rebuild containers
docker-compose down
docker-compose up --build -d
```

### 4. Database connection issues

```bash
# Kiểm tra MySQL container
docker-compose exec mysql mysql -u root -plht@39412990 -e "SHOW DATABASES;"

# Reset database
docker-compose down -v
docker-compose up -d
```

## 📊 Monitoring

### Health checks:

```bash
# Backend health
curl http://localhost:8080/actuator/health

# Frontend health
curl http://localhost/health
```

### Resource usage:

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

## 🔄 Updates

### Cập nhật code:

```bash
# Pull latest code
git pull

# Rebuild và restart
./deploy.sh update
```

### Cập nhật dependencies:

```bash
# Rebuild containers
docker-compose build --no-cache
docker-compose up -d
```

## 📞 Support

Nếu gặp vấn đề, hãy kiểm tra:

1. Logs của các services
2. Resource usage (RAM, CPU, Disk)
3. Network connectivity
4. Docker và Docker Compose versions

---

**Lưu ý**: Đây là hướng dẫn cho môi trường development. Đối với production, cần thêm các biện pháp bảo mật và monitoring.
