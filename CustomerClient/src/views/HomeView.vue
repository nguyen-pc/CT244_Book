<template>
  <div>
    <div id="carouselExampleIndicators" class="carousel slide carousel-fade" data-bs-ride="carousel">
      <div class="carousel-indicators">
        <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" class="active"
          aria-current="true" aria-label="Slide 1"></button>
        <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1"
          aria-label="Slide 2"></button>
        <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2"
          aria-label="Slide 3"></button>
      </div>
      <div class="carousel-inner">
        <div class="carousel-item active">
          <img class="d-block w-100" src="@/assets/images/img-03.png" alt="First slide" />
        </div>
        <div class="carousel-item">
          <img class="d-block w-100" src="@/assets/images/banner_3.jpg" alt="Second slide" />
        </div>
        <div class="carousel-item">
          <img class="d-block w-100" src="@/assets/images/banner_4.jpg" alt="Third slide" />
        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators"
        data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators"
        data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>

    <div class="container my-5">
      <section class="mb-5">
        <h2 class="b-green mb-4">Các Tác Giả</h2>
        <AuthorView />
      </section>

      <section class="mb-5">
        <h2 class="b-green mb-4">Danh Mục Sách</h2>
        <div class="row">
          <!-- CardView sẽ tự render các cột 12 -->
          <CardView />
        </div>
      </section>

      <section class="mb-5">
        <h2 class="b-green mb-2">Về Book Store</h2>
        <h3 class="c-green mb-4"><i>Bởi vì sách là thế giới</i></h3>
        <div class="row align-items-center">
          <div class="col-lg-6 mb-4 mb-lg-0">
            <p class="text-secondary text-justify">
              BookStore, tên đầy đủ là Công ty Cổ phần Văn hóa và Truyền thông BookStore, gia nhập
              thị trường sách Việt Nam vào tháng 2 năm 2024. Ngay từ cuốn sách đầu tiên, độc giả
              đã dành sự quan tâm và yêu mến cho một thương hiệu sách mới mẻ mang trong mình
              khát vọng góp phần tạo lập diện mạo mới cho xuất bản văn học tại Việt Nam.
            </p>
          </div>
          <div class="col-lg-6 text-center">
            <img class="img-fluid rounded shadow" src="../assets/images/banner.png" alt="Banner" />
          </div>
        </div>
      </section>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import CardView from "../components/CardView.vue";
import FooterView from "../components/FooterView.vue";
import AuthorView from "../components/AuthorView.vue";
</script>

<style scoped>
/* Custom styles */
.b-green {
  border-top: 3px solid green;
  padding-top: 10px;
  color: green;
  font-size: 1.5rem;
  /* Tối ưu hóa kích thước font */
  font-weight: 700;
}

.c-green {
  padding-bottom: 10px;
  color: green;
  font-size: 1.1rem;
  /* Tối ưu hóa kích thước font */
  font-weight: 400;
}

.carousel-inner img {
  height: 400px;
  object-fit: cover;
  /* Cắt ảnh để vừa khung hình */
}

/* Điều chỉnh lại kích thước banner trên các màn hình nhỏ hơn */
@media (max-width: 768px) {
  .carousel-inner img {
    height: 250px;
  }
}

/* Tùy chỉnh khoảng cách và font cho phần giới thiệu */
.text-justify {
  text-align: justify;
}

/* Thêm các hiệu ứng hover cho CardView (tùy chọn) */
.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
</style>