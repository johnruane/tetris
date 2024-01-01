/*
 * Gets the DOM row pased as an index, loops though each cell performing the animation. If onFinishCallback is passed
 * then this is executed when animation finishes.
 * The cancel() call removes the effects of the animation, restoring the cell scale.
 */
export const animateCompleteRow = (index, onFinishCallback) => {
  // Gets the DOM row passed as an index
  const rowDOM = document
    .querySelectorAll('[data-animation="game-board"]')[0]
    .children.item(index);

  /*
   * Iterate through each element in the row and perform scale & rotate transform on the ::after element. We don't animate
   * the DOM element itself as that would effect the layout of the board. The ::after element is what contains the block colours.
   */
  Array.from(rowDOM.children).forEach((element) => {
    const rabbitDownKeyframes = new KeyframeEffect(
      element,
      [{ opacity: 0 }, { opacity: 1 }],
      {
        duration: 200,
        iterations: 3,
        fill: 'backwards',
        pseudoElement: '::after',
        easing: 'ease-in-out',
      }
    );
    const rabbitDownAnimation = new Animation(rabbitDownKeyframes, document.timeline);
    rabbitDownAnimation.onfinish = () => {
      rabbitDownAnimation.cancel();
      if (onFinishCallback) {
        onFinishCallback();
      }
    };
    rabbitDownAnimation.play();
  });
};
