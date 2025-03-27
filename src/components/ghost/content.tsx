"use client";

import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import { useEffect } from "react";

export const Content = ({ data }: { data: string }) => {
  useEffect(() => {
    let lightbox: PhotoSwipeLightbox | undefined;
    lightbox = new PhotoSwipeLightbox({
      gallery: ".kg-gallery-card",
      children: ".kg-gallery-image",
      showHideOpacity: true,
      pswpModule: () => import("photoswipe"),
    });
    lightbox.init();
    return () => {
      lightbox?.destroy();
      lightbox = undefined;
    };
  }, []);
  return (
    <>
      <div
        className="prose max-w-none prose-img:my-0"
        dangerouslySetInnerHTML={{ __html: data }}
      />
    </>
  );
};

const handleThumbnailsClick = (e: React.MouseEvent) => {
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

    prevSibling.querySelectorAll("img").forEach((item) => {
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
    nextSibling.querySelectorAll("img").forEach((item) => {
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
};

// function lightbox(trigger: string) {
//   let triggers = document.querySelectorAll(trigger);
//   triggers.forEach(function (trig) {
//     trig.addEventListener("click", function (e) {
//       handleThumbnailsClick(e);
//     });
//   });
// }
