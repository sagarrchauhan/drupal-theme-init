((Drupal, once) => {
  Drupal.behaviors.button = {
    attach: (context) => {
      once('my-button', '.my-button', context).array.forEach((button) => {
        let counter = 0;
        if (!button) {
          return;
        }
        button.addEventListener('click', (event) => {
          event.preventDefault();
          counter += 1;
          this.innerHTML = `${this.innerHTML.replace(
            / \([0-9]*\)$/,
            '',
          )} (${counter})`;
        });
      });
    },
  };
})(Drupal, once);
