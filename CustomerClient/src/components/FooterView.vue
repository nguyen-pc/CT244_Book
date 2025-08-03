<template>
  <footer class="bg-light py-5">
    <div class="container">
      <div class="row">
        <div class="col-md-4 col-sm-12 mb-4 mb-md-0">
          <div class="d-flex align-items-center mb-3">
            <img class="logo-img me-3" src="../assets/images/logo.png" alt="Logo" />
            <h5 class="footer-title-logo text-success">Bởi vì sách là thế giới</h5>
          </div>
          <p class="text-secondary d-flex align-items-start mb-2">
            <img class="footer-icon me-2 mt-1" src="../assets/images/address.webp" alt="Địa chỉ" />
            <span class="footer-text">Khu II, Đ. 3 Tháng 2, Xuân Khánh,<br />Ninh Kiều, Cần Thơ</span>
          </p>
          <p class="text-secondary d-flex align-items-center mb-2">
            <img class="footer-icon me-2" src="../assets/images/email.png" alt="Email" />
            <span class="footer-text">nguyenb2203516@gmail.com</span>
          </p>
          <p class="text-secondary d-flex align-items-center mb-2">
            <img class="footer-icon me-2" src="../assets/images/phone.png" alt="Điện thoại" />
            <span class="footer-text">0788812970</span>
          </p>
        </div>

        <div class="col-md-2 col-sm-6 mb-4 mb-md-0 d-none d-md-block">
          <h5 class="footer-title text-success mb-3">Giới thiệu</h5>
          <ul class="list-unstyled">
            <li><a href="#" class="footer-link">Về BookStore</a></li>
            <li><a href="#" class="footer-link">Hệ thống hiệu sách</a></li>
            <li><a href="#" class="footer-link">Liên hệ chúng tôi</a></li>
          </ul>
        </div>

        <div class="col-md-3 col-sm-6 mb-4 mb-md-0 d-none d-md-block">
          <h5 class="footer-title text-success mb-3">Chính Sách</h5>
          <ul class="list-unstyled">
            <li><a href="#" class="footer-link">Chính sách bảo mật</a></li>
            <li><a href="#" class="footer-link">Chính sách mượn/trả sách</a></li>
            <li><a href="#" class="footer-link">Chính sách vận chuyển</a></li>
          </ul>
        </div>

        <div class="col-md-3 col-sm-12">
          <h5 class="footer-title text-success mb-3">Bản đồ</h5>
          <div class="ratio ratio-16x9">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.8415254397754!2d105.76842637452399!3d10.02993897252277!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0895a515f4e3f%3A0xc4f5a3b2b0c302f!2sC%C3%B4ng%20vi%C3%AAn%20L%C6%B0u%20H%E1%BB%AFu%20Ph%C6%B0%E1%BB%9Bc!5e0!3m2!1svi!2s"
              width="600" height="450" style="border:0;" allowfullscreen="true" loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </div>
    </div>
    <div class="text-center py-3 mt-4 text-secondary border-top">
      © 2025 Copyright: BookStore. All Rights Reserved.
    </div>
  </footer>
</template>

<script setup lang="ts"></script>
<style scoped>
/* Không cần thay đổi CSS, vì chúng ta đã dùng các class của Bootstrap */
.bg-light {
  background-color: #e9f4ea !important;
}

/* Logo */
.logo-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.footer-title-logo {
  font-size: 1.25rem;
  font-weight: 500;
  font-style: italic;
  color: #228b22;
}

/* Các tiêu đề chính */
.footer-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #228b22;
}

/* Icon */
.footer-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* Text */
.footer-text {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #555;
}

/* Link */
.footer-link {
  text-decoration: none;
  color: #555;
  transition: color 0.3s ease;
  display: block;
  /* Mỗi link chiếm một dòng */
  margin-bottom: 0.5rem;
}

.footer-link:hover {
  color: #228b22;
  text-decoration: underline;
}

/* Responsive cho bản đồ */
.ratio {
  height: 200px;
}

/* Tùy chỉnh các lớp khác */
.list-unstyled {
  list-style: none;
  padding-left: 0;
}
</style>