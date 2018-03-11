# stickify
Stickify was developed as a way to position content elements in a sidebar in a way that they will all stick to the header for an even amount of time as the user scrolls down a page. So imagine you're on a blog and you have a 6000px tall article that has a sidebar on the right with 3 ads. Stickify will take that sidebar and create 3 2000px tall sections in which the ad for that section will stick to the top of the page as the user scrolls further down. As the user scrolls into a new ad section, the following ad will push the current ad up and off the page and then stick for its section.

1) Add stickify.js file to your JavaScript folder and reference it on the page.
2)

Options
animatedHeader - default: false, set to true if your header changes height when the user scrolls down the page
content - default: '#content', div in which the articles and sidebar live
heightAnimations - default: false, set to true if your site has other height altering animations
minScreenSize - default: 1008, min screen size in which you want the stickify plugin to turn on
stickyContainer - default: '.ads', div with sticky adds that will be divided evenly
stickyHeader - default: false, set to true if your site uses a fixed header
stickyItems - default: '.ad', sticky ad class
stickyInternalClass - default: 'internal', sticky ad internal container class
stickyPaddingTop - default: 30, pixel amount of sticky ad padding from top
stickyPaddingBottom - default: 30, pixel amount of sticky ad padding from bottom
topTransitionSpeed - default: 0, CSS3 top transition speed when sticking
onAdFix - callback function when ad fixes to top
onAdEnd - callback function when ad stops sticking
onAdReset - callback function when ad gets set back to static as user scrolls up
