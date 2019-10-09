'use strict';
const galleryItem = document.getElementById('gallery').getElementsByTagName("*");
//console.log(galleryItem);

//cont allChildrenDeep = oDiv.getElementsByTagName("*");
const gallery = {
    settings: {
        previewSelector: '.mySuperGallery',
        openedImageWrapperClass: 'galleryWrapper',
        openedImageClass: 'galleryWrapper__image',
        openedImageScreenClass: 'galleryWrapper__screen',
        openedImageCloseBtnClass: 'galleryWrapper__close',
        openedImageCloseBtnSrc: 'images/gallery/close.png',
    },


    init(userSettings = {}) {
        Object.assign(this.settings, userSettings);
        document.querySelector(this.settings.previewSelector)
            .addEventListener('click', event => {
                this.containerClickHandler(event)
            });
    },

    containerClickHandler(event) {
        if (event.target.tagName !== 'IMG' ||  event.target.dataset.full_image_url == undefined) return;
        this.openImage(event.target.dataset.full_image_url);
    },

    openImage(src) {
        this.getScreenContainer().querySelector(`.${this.settings.openedImageClass}`).src = src;
    },

    getScreenContainer() {
        const galleryWrapperElement = document
            .querySelector(`.${this.settings.openedImageWrapperClass}`);

        if (galleryWrapperElement) return galleryWrapperElement;

        return this.createScreenContainer();
    },

    createScreenContainer() {
        const galleryWrapperElement = document.createElement('div');
        galleryWrapperElement.classList.add(this.settings.openedImageWrapperClass);

        const galleryScreenElement = document.createElement('div');
        galleryScreenElement.classList.add(this.settings.openedImageScreenClass);
        galleryWrapperElement.appendChild(galleryScreenElement);

        const closeImageElement = new Image();
        closeImageElement.classList.add(this.settings.openedImageCloseBtnClass);
        closeImageElement.src = this.settings.openedImageCloseBtnSrc;
        closeImageElement.addEventListener('click', () => this.close());
        galleryWrapperElement.appendChild(closeImageElement);

        const left = document.createElement('div');
        left.classList.add('left');
        left.innerHTML = 'назад';
        left.addEventListener('click', () => this.preImg());
        galleryWrapperElement.appendChild(left);

        const right = document.createElement('div');
        right.classList.add('right');
        right.innerHTML = 'вперед';
        right.addEventListener('click', () => this.nextImg());
        galleryWrapperElement.appendChild(right);

        const image = new Image();
        image.classList.add(this.settings.openedImageClass);
        image.dataset.num = event.target.dataset.num;
        galleryWrapperElement.appendChild(image);

        document.body.appendChild(galleryWrapperElement);

        return galleryWrapperElement;
    },

    nextImg(){
        let img = document.getElementsByClassName(this.settings.openedImageClass);
        let imgSrc = "";
        if ((+img[0].dataset.num + 1) > galleryItem.length) {
            imgSrc =  galleryItem[0].dataset.full_image_url;
            img[0].dataset.num = 1;

        }
        else {
            for (let i = 0; i < galleryItem.length; i++) {
                if (galleryItem[i].dataset.num == (+img[0].dataset.num + 1)) {
                    imgSrc = galleryItem[i].dataset.full_image_url;
                }
            }
            img[0].dataset.num = +img[0].dataset.num + 1;
        }
        if (imgSrc != undefined ) img[0].src = imgSrc;
    },

    preImg(){
        let img = document.getElementsByClassName(this.settings.openedImageClass);
        let imgSrc = "";
        if ((+img[0].dataset.num - 1) == 0) {
            imgSrc =  galleryItem[galleryItem.length - 1].dataset.full_image_url;
            img[0].dataset.num = galleryItem.length - 1;

        }
        else {
            for (let i = galleryItem.length -1 ; i > -1; i--) {
                if (galleryItem[i].dataset.num == (+img[0].dataset.num - 1)) {
                    imgSrc = galleryItem[i].dataset.full_image_url;
                    console.log(imgSrc);
                }
            }
            img[0].dataset.num = +img[0].dataset.num - 1;
        }
        if (imgSrc != undefined ) img[0].src = imgSrc;
    },


    close() {
        document.querySelector(`.${this.settings.openedImageWrapperClass}`).remove();
    },
};

window.addEventListener('load', () => {
    gallery.init({previewSelector: '.galleryPreviewsContainer'});
});
