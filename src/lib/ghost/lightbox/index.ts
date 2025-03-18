import PhotoSwipeUI_Default from "./photoswipe-ui-default.min.js";
import PhotoSwipe from "./photoswipe.min.js";

export function lightbox(trigger: string) {
  let onThumbnailsClick = function (e: MouseEvent) {
    e.preventDefault();

    let items = [];
    let index = 0;

    let prevSibling = e.target.closest(".kg-card").previousElementSibling;

    while (
      prevSibling &&
      (prevSibling.classList.contains("kg-image-card") ||
        prevSibling.classList.contains("kg-gallery-card"))
    ) {
      let prevItems = [];

      prevSibling.querySelectorAll("img").forEach(function (item) {
        prevItems.push({
          src: item.getAttribute("src"),
          msrc: item.getAttribute("src"),
          w: item.getAttribute("width"),
          h: item.getAttribute("height"),
          el: item,
        });

        index += 1;
      });
      prevSibling = prevSibling.previousElementSibling;

      items = prevItems.concat(items);
    }

    if (e.target.classList.contains("kg-image")) {
      items.push({
        src: e.target.getAttribute("src"),
        msrc: e.target.getAttribute("src"),
        w: e.target.getAttribute("width"),
        h: e.target.getAttribute("height"),
        el: e.target,
      });
    } else {
      let reachedCurrentItem = false;

      e.target
        .closest(".kg-gallery-card")
        .querySelectorAll("img")
        .forEach(function (item) {
          items.push({
            src: item.getAttribute("src"),
            msrc: item.getAttribute("src"),
            w: item.getAttribute("width"),
            h: item.getAttribute("height"),
            el: item,
          });

          if (!reachedCurrentItem && item !== e.target) {
            index += 1;
          } else {
            reachedCurrentItem = true;
          }
        });
    }

    let nextSibling = e.target.closest(".kg-card").nextElementSibling;

    while (
      nextSibling &&
      (nextSibling.classList.contains("kg-image-card") ||
        nextSibling.classList.contains("kg-gallery-card"))
    ) {
      nextSibling.querySelectorAll("img").forEach(function (item) {
        items.push({
          src: item.getAttribute("src"),
          msrc: item.getAttribute("src"),
          w: item.getAttribute("width"),
          h: item.getAttribute("height"),
          el: item,
        });
      });
      nextSibling = nextSibling.nextElementSibling;
    }

    let pswpElement = document.querySelectorAll(".pswp")[0];

    let options = {
      bgOpacity: 0.9,
      closeOnScroll: true,
      fullscreenEl: false,
      history: false,
      index: index,
      shareEl: false,
      zoomEl: false,
      getThumbBoundsFn: function (index) {
        let thumbnail = items[index].el,
          pageYScroll =
            window.pageYOffset || document.documentElement.scrollTop,
          rect = thumbnail.getBoundingClientRect();

        return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
      },
    };

    let gallery = new PhotoSwipe(
      pswpElement,
      PhotoSwipeUI_Default,
      items,
      options
    );
    gallery.init();

    return false;
  };

  let triggers = document.querySelectorAll(trigger);
  triggers.forEach(function (trig) {
    trig.addEventListener("click", function (e) {
      onThumbnailsClick(e);
    });
  });
}
