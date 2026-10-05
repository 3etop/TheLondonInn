// London Inn Menu - JS organizado y limpio
// Funciones: filtrado, animación, modal, carrusel, rating

document.addEventListener('DOMContentLoaded', () => {
  // --- Filtrado y animación de tarjetas ---
  const filterButtons = document.querySelectorAll('.filter-btn');
  const products = document.querySelectorAll('.product');
  const menu = document.querySelector('.menu');
  const filterNav = document.querySelector('.filters');
  const filterToggle = document.querySelector('.filter-toggle');

  const setFilterMenuOpen = isOpen => {
    filterNav.classList.toggle('is-open', isOpen);
    filterToggle.setAttribute('aria-expanded', String(isOpen));
  };

  filterToggle.addEventListener('click', () => {
    setFilterMenuOpen(filterToggle.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && filterNav.classList.contains('is-open')) {
      setFilterMenuOpen(false);
      filterToggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 700) setFilterMenuOpen(false);
  });

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');
      filterButtons.forEach(filterButton => {
        const isSelected = filterButton === button;
        filterButton.classList.toggle('is-active', isSelected);
        filterButton.setAttribute('aria-pressed', String(isSelected));
      });
      if (window.innerWidth <= 700) {
        setFilterMenuOpen(false);
        filterToggle.focus();
      }
      menu.classList.remove('is-unfiltered');
      let visibleIndex = 0;
      // Lógica especial para comidas
      if (category === 'comidas') {
        menu.classList.add('comidas-horizontal');
      } else {
        menu.classList.remove('comidas-horizontal');
      }
      products.forEach(product => {
        if (category === 'all' || product.getAttribute('data-category') === category) {
          product.style.display = 'block';
          product.style.animation = 'none';
          product.offsetHeight;
          product.style.animation = `fadeInUp 0.7s cubic-bezier(.23,1.02,.32,1) both`;
          product.style.animationDelay = (visibleIndex * 0.08) + 's';
          visibleIndex++;
        } else {
          product.style.display = 'none';
          product.style.animation = 'none';
        }
      });
    });
  });

  // --- Modal para zoom de imágenes ---
  const imageModal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const closeBtn = document.querySelector('.close');
  const mapDialog = document.getElementById('mapDialog');
  const mapCloseBtn = document.querySelector('.map-dialog__close');
  const addressLink = document.querySelector('.contact-address');

  document.querySelectorAll('.product img, .carousel-image').forEach(img => {
    img.addEventListener('click', e => {
      imageModal.style.display = 'block';
      modalImage.src = img.src;
      e.stopPropagation();
    });
  });
  closeBtn.addEventListener('click', () => imageModal.style.display = 'none');
  imageModal.addEventListener('click', e => { if (e.target === imageModal) imageModal.style.display = 'none'; });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    imageModal.style.display = 'none';
    if (mapDialog.open) mapDialog.close();
  });

  addressLink.addEventListener('click', event => {
    event.preventDefault();
    mapDialog.showModal();
  });
  mapCloseBtn.addEventListener('click', () => mapDialog.close());
  mapDialog.addEventListener('click', event => {
    if (event.target === mapDialog) mapDialog.close();
  });

  // --- Carrusel de imágenes ---
  document.querySelectorAll('.carousel').forEach(carousel => {
    const images = carousel.querySelectorAll('.carousel-image');
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    let currentIndex = 0;
    function showImage(index) {
      images.forEach(img => img.classList.remove('active'));
      if (images[index]) images[index].classList.add('active');
    }
    if (prevBtn && nextBtn && images.length > 0) {
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        showImage(currentIndex);
      });
      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
      });
      setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
      }, 3000);
    }
  });

  // --- Estrellas de puntuación ---
  document.querySelectorAll('.rating-stars').forEach(starBlock => {
    const productKey = starBlock.getAttribute('data-product');
    const stars = Array.from(starBlock.querySelectorAll('.star'));
    const productName = starBlock.closest('.product').querySelector('h3').textContent.trim();
    const storageKey = 'rating-' + productKey;

    starBlock.setAttribute('role', 'radiogroup');
    starBlock.setAttribute('aria-label', `Valora ${productName}`);

    const getSavedRating = () => Number(localStorage.getItem(storageKey)) || 0;
    const renderRating = value => {
      stars.forEach(star => {
        star.classList.toggle('filled', Number(star.dataset.value) <= value);
      });
    };
    const setRating = (value, moveFocus = false) => {
      localStorage.setItem(storageKey, String(value));
      stars.forEach(star => {
        const isSelected = Number(star.dataset.value) === value;
        star.setAttribute('aria-checked', String(isSelected));
        star.tabIndex = isSelected ? 0 : -1;
      });
      renderRating(value);
      if (moveFocus) stars[value - 1].focus();
    };

    const savedRating = getSavedRating();
    stars.forEach((star, index) => {
      const value = index + 1;
      star.setAttribute('role', 'radio');
      star.setAttribute('aria-label', `${value} de ${stars.length} estrellas`);
      star.setAttribute('aria-checked', String(savedRating === value));
      star.tabIndex = savedRating ? (savedRating === value ? 0 : -1) : (index === 0 ? 0 : -1);

      star.addEventListener('click', () => setRating(value, true));
      star.addEventListener('keydown', event => {
        let nextValue;
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
          nextValue = value % stars.length + 1;
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
          nextValue = (value + stars.length - 2) % stars.length + 1;
        } else if (event.key === 'Home') {
          nextValue = 1;
        } else if (event.key === 'End') {
          nextValue = stars.length;
        } else if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
          nextValue = value;
        } else {
          return;
        }
        event.preventDefault();
        setRating(nextValue, true);
      });
      star.addEventListener('mouseenter', () => renderRating(value));
      star.addEventListener('mouseleave', () => renderRating(getSavedRating()));
    });
    renderRating(savedRating);
  });
});