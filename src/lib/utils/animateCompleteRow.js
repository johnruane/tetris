/*
 * Gets the DOM row pased as an index, loops though each cell performing the animation. If onFinishCallback is passed
 * then this is executed when animation finishes.
 * The cancel() call removes the effects of the animation, restoring the cell scale.
 */
export const animateCompleteRow = (index, onFinishCallback) => {
  // Gets the DOM row passed as an index
  const rowDOM = document.querySelectorAll('[data-animate="row"]').item(index);

  /*
   * Iterate through each element in the row and perform scale & rotate transform on the ::after element. We don't animate
   * the DOM element itself as that would effect the layout of the board. The ::after element is what contains the block colours.
   */
  const animations = Array.from(rowDOM.children).map((element, index, array) => {
    const rabbitDownAnimation = element.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 150,
      fill: 'forwards',
      easing: 'ease-out',
      pseudoElement: '::after',
      delay: index * 40,
    });

    return new Promise((resolve) => {
      rabbitDownAnimation.onfinish = () => {
        rabbitDownAnimation.persist();
        rabbitDownAnimation.cancel();
        resolve();
      };
    });
  });

  Promise.all(animations).then(() => {
    if (onFinishCallback) {
      onFinishCallback();
    }
  });
};
