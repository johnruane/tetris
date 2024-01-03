/*
 * Gets the DOM row pased as an index, loops though each cell performing the animation. If onFinishCallback is passed
 * then this is executed when animation finishes.
 * The cancel() call removes the effects of the animation, restoring the cell scale.
 */
export const animateCompleteRow = (index, onFinishCallback) => {
  // Gets the DOM row passed as an index
  const rowDOM = document.querySelectorAll('[data-animate="row"]').item(index);

  /*
   * Once the animations have completed we need to change opacity back to 1. Not able to use cancel() as we want the animation to
   * persist until all are complete. Tried persist() but didn't work. Can only use cancel() when all Promise resolve, but by that time
   * we've lost the reference to the elements. animationReset() is a not too hacky work around.
   */
  function animationsReset() {
    Array.from(rowDOM.children).forEach((element) => {
      const rabbitDownAnimation = element.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 0,
        fill: 'forwards',
        easing: 'ease-out',
        pseudoElement: '::after',
      });

      rabbitDownAnimation.play();
    });
  }

  /*
   * Iterate through each element in the row and perform scale & rotate transform on the ::after element. We don't animate
   * the DOM element itself as that would effect the layout of the board. The ::after element is what contains the block colours.
   */
  const animations = Array.from(rowDOM.children).map((element, index, array) => {
    const rabbitDownAnimation = element.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 100,
      fill: 'forwards',
      easing: 'ease-out',
      pseudoElement: '::after',
      delay: index * 30,
    });

    return new Promise((resolve) => {
      rabbitDownAnimation.onfinish = () => {
        resolve();
      };
    });
  });

  Promise.all(animations).then(() => {
    if (onFinishCallback) {
      onFinishCallback();
      animationsReset();
    }
  });
};
