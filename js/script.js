(function () {
  "use strict";

  var navBtn = document.getElementById("nav-btn");
  var takeoverNav = document.getElementById("takeover-nav");
  if (!navBtn || !takeoverNav) return;

  /// Initiation Variables
  var icon_1 = navBtn;
  var topLine_1 = document.getElementById("top-line-1");
  var middleLine_1 = document.getElementById("middle-line-1");
  var bottomLine_1 = document.getElementById("bottom-line-1");
  var state_1 = "menu";
  var topLineY_1;
  var middleLineY_1;
  var bottomLineY_1;
  var topLeftY_1;
  var topRightY_1;
  var bottomLeftY_1;
  var bottomRightY_1;
  var topLeftX_1;
  var topRightX_1;
  var bottomLeftX_1;
  var bottomRightX_1;

  /// Animation Variables
  var segmentDuration_1 = 15;
  var menuDisappearDurationInFrames_1 = segmentDuration_1;
  var arrowAppearDurationInFrames_1 = segmentDuration_1;
  var arrowDisappearDurationInFrames_1 = segmentDuration_1;
  var menuAppearDurationInFrames_1 = segmentDuration_1;
  var menuDisappearComplete_1 = false;
  var arrowAppearComplete_1 = false;
  var arrowDisappearComplete_1 = false;
  var menuAppearComplete_1 = false;
  var currentFrame_1 = 1;

  function setNavOpen(isOpen) {
    navBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    navBtn.setAttribute(
      "aria-label",
      isOpen ? "Close menu" : "Open menu"
    );
  }

  function syncBodyNavLock() {
    var open = takeoverNav.classList.contains("shown");
    document.body.classList.toggle("nav-open", open);
  }

  /// Menu Disappear
  function menuDisappearAnimation_1() {
    currentFrame_1++;
    if (currentFrame_1 <= menuDisappearDurationInFrames_1) {
      window.requestAnimationFrame(function () {
        topLineY_1 = AJS.easeInBack(
          37,
          50,
          menuDisappearDurationInFrames_1,
          currentFrame_1
        );
        topLine_1.setAttribute(
          "d",
          "M30," + topLineY_1 + " L70," + topLineY_1
        );
        bottomLineY_1 = AJS.easeInBack(
          63,
          50,
          menuDisappearDurationInFrames_1,
          currentFrame_1
        );
        bottomLine_1.setAttribute(
          "d",
          "M30," + bottomLineY_1 + " L70," + bottomLineY_1
        );
        menuDisappearAnimation_1();
      });
    } else {
      middleLine_1.style.opacity = "0";
      currentFrame_1 = 1;
      menuDisappearComplete_1 = true;
      openMenuAnimation_1();
    }
  }

  /// Cross Appear
  function arrowAppearAnimation_1() {
    currentFrame_1++;
    if (currentFrame_1 <= arrowAppearDurationInFrames_1) {
      window.requestAnimationFrame(function () {
        topLeftX_1 = AJS.easeOutBack(
          30,
          35,
          arrowAppearDurationInFrames_1,
          currentFrame_1
        );
        topLeftY_1 = AJS.easeOutBack(
          50,
          35,
          arrowAppearDurationInFrames_1,
          currentFrame_1
        );
        bottomRightX_1 = AJS.easeOutBack(
          70,
          65,
          arrowAppearDurationInFrames_1,
          currentFrame_1
        );
        bottomRightY_1 = AJS.easeOutBack(
          50,
          65,
          arrowAppearDurationInFrames_1,
          currentFrame_1
        );
        topLine_1.setAttribute(
          "d",
          "M" +
            topLeftX_1 +
            "," +
            topLeftY_1 +
            " L" +
            bottomRightX_1 +
            "," +
            bottomRightY_1
        );
        bottomLeftX_1 = AJS.easeOutBack(
          30,
          35,
          arrowAppearDurationInFrames_1,
          currentFrame_1
        );
        bottomLeftY_1 = AJS.easeOutBack(
          50,
          65,
          arrowAppearDurationInFrames_1,
          currentFrame_1
        );
        topRightX_1 = AJS.easeOutBack(
          70,
          65,
          arrowAppearDurationInFrames_1,
          currentFrame_1
        );
        topRightY_1 = AJS.easeOutBack(
          50,
          35,
          arrowAppearDurationInFrames_1,
          currentFrame_1
        );
        bottomLine_1.setAttribute(
          "d",
          "M" +
            bottomLeftX_1 +
            "," +
            bottomLeftY_1 +
            " L" +
            topRightX_1 +
            "," +
            topRightY_1
        );
        arrowAppearAnimation_1();
      });
    } else {
      currentFrame_1 = 1;
      arrowAppearComplete_1 = true;
      openMenuAnimation_1();
    }
  }

  /// Combined Open Menu Animation
  function openMenuAnimation_1() {
    if (!menuDisappearComplete_1) {
      menuDisappearAnimation_1();
    } else if (!arrowAppearComplete_1) {
      arrowAppearAnimation_1();
    }
  }

  /// Cross Disappear
  function arrowDisappearAnimation_1() {
    currentFrame_1++;
    if (currentFrame_1 <= arrowDisappearDurationInFrames_1) {
      window.requestAnimationFrame(function () {
        topLeftX_1 = AJS.easeInBack(
          35,
          30,
          arrowDisappearDurationInFrames_1,
          currentFrame_1
        );
        topLeftY_1 = AJS.easeInBack(
          35,
          50,
          arrowDisappearDurationInFrames_1,
          currentFrame_1
        );
        bottomRightX_1 = AJS.easeInBack(
          65,
          70,
          arrowDisappearDurationInFrames_1,
          currentFrame_1
        );
        bottomRightY_1 = AJS.easeInBack(
          65,
          50,
          arrowDisappearDurationInFrames_1,
          currentFrame_1
        );
        topLine_1.setAttribute(
          "d",
          "M" +
            topLeftX_1 +
            "," +
            topLeftY_1 +
            " L" +
            bottomRightX_1 +
            "," +
            bottomRightY_1
        );
        bottomLeftX_1 = AJS.easeInBack(
          35,
          30,
          arrowDisappearDurationInFrames_1,
          currentFrame_1
        );
        bottomLeftY_1 = AJS.easeInBack(
          65,
          50,
          arrowDisappearDurationInFrames_1,
          currentFrame_1
        );
        topRightX_1 = AJS.easeInBack(
          65,
          70,
          arrowDisappearDurationInFrames_1,
          currentFrame_1
        );
        topRightY_1 = AJS.easeInBack(
          35,
          50,
          arrowDisappearDurationInFrames_1,
          currentFrame_1
        );
        bottomLine_1.setAttribute(
          "d",
          "M" +
            bottomLeftX_1 +
            "," +
            bottomLeftY_1 +
            " L" +
            topRightX_1 +
            "," +
            topRightY_1
        );
        arrowDisappearAnimation_1();
      });
    } else {
      middleLine_1.style.opacity = "1";
      currentFrame_1 = 1;
      arrowDisappearComplete_1 = true;
      closeMenuAnimation_1();
    }
  }

  /// Menu Appear
  function menuAppearAnimation_1() {
    currentFrame_1++;
    if (currentFrame_1 <= menuAppearDurationInFrames_1) {
      window.requestAnimationFrame(function () {
        topLineY_1 = AJS.easeOutBack(
          50,
          37,
          menuDisappearDurationInFrames_1,
          currentFrame_1
        );
        topLine_1.setAttribute(
          "d",
          "M30," + topLineY_1 + " L70," + topLineY_1
        );
        bottomLineY_1 = AJS.easeOutBack(
          50,
          63,
          menuDisappearDurationInFrames_1,
          currentFrame_1
        );
        bottomLine_1.setAttribute(
          "d",
          "M30," + bottomLineY_1 + " L70," + bottomLineY_1
        );
        menuAppearAnimation_1();
      });
    } else {
      currentFrame_1 = 1;
      menuAppearComplete_1 = true;
      closeMenuAnimation_1();
    }
  }

  /// Close Menu Animation
  function closeMenuAnimation_1() {
    if (!arrowDisappearComplete_1) {
      arrowDisappearAnimation_1();
    } else if (!menuAppearComplete_1) {
      menuAppearAnimation_1();
    }
  }

  /// Nav toggle + icon animation
  icon_1.addEventListener("click", function () {
    if (typeof window.jQuery !== "undefined") {
      window.jQuery("#takeover-nav").toggleClass("shown");
      window.jQuery(".sticky-nav").toggleClass("difference");
    } else {
      takeoverNav.classList.toggle("shown");
      document
        .querySelector(".sticky-nav")
        .classList.toggle("difference");
    }

    syncBodyNavLock();

    if (state_1 === "menu") {
      setNavOpen(true);
      openMenuAnimation_1();
      state_1 = "arrow";
      arrowDisappearComplete_1 = false;
      menuAppearComplete_1 = false;
    } else if (state_1 === "arrow") {
      setNavOpen(false);
      closeMenuAnimation_1();
      state_1 = "menu";
      menuDisappearComplete_1 = false;
      arrowAppearComplete_1 = false;
    }
  });

  function initCustomCursor() {
    var cursor = document.querySelector(".custom-cursor");
    if (!cursor || typeof TweenLite === "undefined") return;

    var links = document.querySelectorAll(
      "a, button, #nav-btn, input.btn"
    );
    var initCursor = false;

    for (var i = 0; i < links.length; i++) {
      var selfLink = links[i];
      selfLink.addEventListener("mouseover", function () {
        cursor.classList.add("custom-cursor--link");
      });
      selfLink.addEventListener("mouseout", function () {
        cursor.classList.remove("custom-cursor--link");
      });
    }

    window.onmousemove = function (e) {
      var mouseX = e.clientX;
      var mouseY = e.clientY;

      if (!initCursor) {
        TweenLite.to(cursor, 0.5, {
          opacity: 1,
        });
        initCursor = true;
      }

      TweenLite.to(cursor, 0, {
        top: mouseY + "px",
        left: mouseX + "px",
      });
    };

    window.ontouchmove = function (e) {
      var mouseX = e.touches[0].clientX;
      var mouseY = e.touches[0].clientY;
      if (!initCursor) {
        TweenLite.to(cursor, 0.3, {
          opacity: 1,
        });
        initCursor = true;
      }

      TweenLite.to(cursor, 0, {
        top: mouseY + "px",
        left: mouseX + "px",
      });
    };

    window.onmouseout = function () {
      TweenLite.to(cursor, 0.3, {
        opacity: 0,
      });
      initCursor = false;
    };

    window.ontouchstart = function () {
      TweenLite.to(cursor, 0.3, {
        opacity: 1,
      });
    };

    window.ontouchend = function () {
      setTimeout(function () {
        TweenLite.to(cursor, 0.3, {
          opacity: 0,
        });
      }, 200);
    };
  }

  function shouldUseCustomCursor() {
    try {
      return (
        window.matchMedia("(pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    } catch (e) {
      return false;
    }
  }

  if (shouldUseCustomCursor()) {
    document.documentElement.classList.add("use-custom-cursor");
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initCustomCursor);
    } else {
      initCustomCursor();
    }
  }
})();
