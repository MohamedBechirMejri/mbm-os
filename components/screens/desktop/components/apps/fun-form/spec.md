1. TIMELINE

* t=0.00s
  * Visible elements: Background container, "+" icon, "Welcome back!" text, Email input field, Password input field, "Log in" button, "Log in with Google" button (with Google "G" icon), "Don't have an account? Sign up" text.
  * Position: "+" icon top center; "Welcome back!" below "+" centered; Email field below text centered (x:50%, y:30%); Password below Email centered; "Log in" button below Password centered; Google button below "Log in" centered; Sign up text bottom center.
  * Size: "+" icon 5% of container height; Text headings 4% height; Input fields 40% width, 5% height; Buttons 40% width, 5% height.
  * Shape: Background rect; "+" as cross paths; Inputs and buttons rounded rect (radius 10px); Text as sans-serif font.
  * Colors: Background #F8F5F2 (light beige); Text black #000000; Inputs white #FFFFFF with gray #CCCCCC border; "Log in" black bg #000000 white text; Google white bg black text.
  * Transforms: None.
  * Opacity / blur / shadow: All opacity 1; No blur; Inputs have subtle shadow (0 1px 2px rgba(0,0,0,0.1)).
  * Shape morphs: None.
  * What changed: Initial state, no prior.

* t=1.00s
  * Visible elements: All from t=0.00s plus purple rectangle, black small rectangle, yellow triangle, orange semicircle; Cursor arrow.
  * Position: Purple rect top-left (x:10%, y:20%, tilted -15deg); Black rect mid-left (x:15%, y:40%); Yellow triangle bottom-left (x:20%, y:60%); Orange semicircle bottom-left overlapping yellow (x:10%, y:55%); Cursor over Password field center.
  * Size: Purple rect 10% width 15% height; Black 3% width 3% height; Yellow 8% width 8% height; Orange 12% width 12% height.
  * Shape: Purple rotated rect; Black rect; Yellow triangle (pointing right); Orange semicircle (flat bottom).
  * Colors: Purple #6A4C93; Black #000000; Yellow #FFD600; Orange #FF7A00.
  * Transforms: Purple rotate(-15deg); Others translate from off-screen left.
  * Opacity / blur / shadow: Shapes opacity 1; No blur; Subtle shadow on shapes (0 2px 4px rgba(0,0,0,0.2)).
  * Shape morphs: None yet, initial appearance.
  * What changed: Added shapes sliding in from left; Cursor appeared over Password; Email field focused (border blue #007BFF).

* t=2.00s
  * Visible elements: All from t=1.00s; Shapes now with eyes and beaks; Email text "<email@domain.com>".
  * Position: Orange bird bottom-left (x:10%, y:55%); Yellow bird mid-left (x:20%, y:60%, beak right); Purple bird top-left (x:10%, y:20%); Cursor over Password.
  * Size: Birds approx 12% width 12% height each.
  * Shape: Orange circle to blob with beak (path: rounded body + triangle beak); Yellow triangle to bird blob with beak and eyes; Purple rect to bird blob with beak and eyes.
  * Colors: Same as t=1.00s; Eyes black circles #000000; Beaks black triangles #000000.
  * Transforms: Scale(1.1) on yellow bird; Rotate(0deg) on purple.
  * Opacity / blur / shadow: Eyes opacity 1; No blur changes.
  * Shape morphs: Purple rect → elongated blob → bird; Yellow triangle → rounded blob → bird; Orange semicircle → full circle → bird; Black rect → eye or beak part.
  * What changed: Shapes morphed to bird forms; Added eyes (two black circles per bird, positioned top); Added beaks (black triangles pointing right); Email field filled with text; Password focused.

* t=3.00s
  * Visible elements: All from t=2.00s; Password field with dots (••••••); Birds' eyes directed toward center.
  * Position: Orange bird shifted right (x:15%, y:55%); Yellow bird center-left (x:25%, y:60%); Purple bird mid-left (x:15%, y:25%); Cursor still over Password.
  * Size: Birds scale(1.0).
  * Shape: Bird blobs refined (smoother paths, curved bodies).
  * Colors: Unchanged.
  * Transforms: TranslateX(5%) on all birds; Eyes translated right within birds (to "look" at input).
  * Opacity / blur / shadow: Unchanged.
  * Shape morphs: Minor body squash on yellow bird (height -10%).
  * What changed: Password filled with obscured text; Birds translated right; Eyes repositioned to focus on Password field.

* t=4.00s
  * Visible elements: All from t=3.00s; Cursor over "Log in" button.
  * Position: Birds clustered left-center (orange x:20%, y:55%; yellow x:30%, y:60%; purple x:20%, y:30%); Eyes looking down-center.
  * Size: Birds scale(1.05) slight bounce.
  * Shape: Bird bodies elongated vertically (stretch effect).
  * Colors: Unchanged.
  * Transforms: ScaleY(1.1) on birds; TranslateY(5%) on eyes.
  * Opacity / blur / shadow: Birds opacity 1; Slight blur (2px) on bodies during stretch.
  * Shape morphs: Body paths stretched (vertices adjusted vertically).
  * What changed: Cursor moved to "Log in" button; Birds shifted right and stretched; Eyes redirected downward.

* t=5.00s
  * Visible elements: All from t=4.00s; Birds with "happy" expressions (eyes curved, beaks up).
  * Position: Birds returned to left (orange x:10%, y:55%; yellow x:20%, y:60%; purple x:10%, y:20%).
  * Size: Birds scale(1.0).
  * Shape: Eyes as half-circles (smile); Beaks rotated +10deg (upward).
  * Colors: Unchanged.
  * Transforms: Rotate(10deg) on beaks; Scale(0.9) on eyes horizontally.
  * Opacity / blur / shadow: No blur; Shadows intensified (0 3px 6px rgba(0,0,0,0.3)).
  * Shape morphs: Eye paths morphed from circle to arc; Beak path adjusted angle.
  * What changed: Birds expressions changed to happy; Positions reset left; Cursor on "Log in with Google".

* t=6.00s
  * Visible elements: All from t=5.00s; No new.
  * Position: Birds slightly bounced up (y:-5% temporary).
  * Size: Birds scale(1.1).
  * Shape: Bodies squashed horizontally (width -5%).
  * Colors: Unchanged.
  * Transforms: TranslateY(-10px) then back; ScaleX(0.95).
  * Opacity / blur / shadow: Opacity 1.
  * Shape morphs: Body paths compressed horizontally.
  * What changed: Birds bounced and squashed (reaction to button hover).

* t=7.00s
  * Visible elements: All from t=6.00s; Email and Password fields as at t=3.00s.
  * Position: Birds eyes looking at button.
  * Size: Unchanged.
  * Shape: Beaks pointed down.
  * Colors: Unchanged.
  * Transforms: Rotate(-5deg) on birds.
  * Opacity / blur / shadow: Unchanged.
  * Shape morphs: Beak angle adjustment.
  * What changed: Eyes redirected to button; Minor rotation on birds.

* t=8.00s
  * Visible elements: All from t=7.00s.
  * Position: Birds clustered tighter left.
  * Size: Scale(0.95).
  * Shape: Bodies rounded more.
  * Colors: Unchanged.
  * Transforms: Scale(0.95); TranslateX(-5%).
  * Opacity / blur / shadow: Slight opacity fade to 0.95 on birds.
  * Shape morphs: Path smoothing.
  * What changed: Birds scaled down and shifted left; Opacity slight decrease.

* t=9.00s
  * Visible elements: All from t=8.00s; Cursor on Sign up text.
  * Position: Birds at initial positions.
  * Size: Scale(1.0).
  * Shape: Back to happy expressions.
  * Colors: Unchanged.
  * Transforms: Reset to t=2.00s.
  * Opacity / blur / shadow: Opacity 1.
  * Shape morphs: None.
  * What changed: Positions reset; Expressions happy; Cursor moved.

1. MOTION

* Transition t=0.00s to t=1.00s: Duration 800ms; Easing ease-out (slows at end); Motion feels soft (shapes slide in smoothly without overshoot).
* Transition t=1.00s to t=2.00s: Duration 600ms; Easing ease-in-out; Motion elastic (morphs stretch slightly before settling).
* Transition t=2.00s to t=3.00s: Duration 400ms; Easing linear; Motion rigid (direct translation of eyes).
* Transition t=3.00s to t=4.00s: Duration 500ms; Easing bounce (stretch with rebound); Motion snappy (quick stretch-release).
* Transition t=4.00s to t=5.00s: Duration 700ms; Easing ease-in; Motion soft (gradual expression change).
* Transition t=5.00s to t=6.00s: Duration 300ms; Easing overshoot; Motion elastic (bounce up and squash).
* Transition t=6.00s to t=7.00s: Duration 400ms; Easing linear; Motion rigid (simple rotation).
* Transition t=7.00s to t=8.00s: Duration 500ms; Easing ease-out; Motion soft (scale down smoothly).
* Transition t=8.00s to t=9.00s: Duration 600ms; Easing ease-in-out; Motion snappy (quick reset).

1. STATE MACHINE

* Idle: Elements visible - all UI without shapes/birds; Resting positions - centered form; Shapes none.
* Focused (Email): Elements visible - shapes appear as geometrics; Resting positions - left side clustered; Shapes rect/circle/triangle.
* Typing (Email): Elements visible - shapes morph to birds; Resting positions - birds left; Shapes bird blobs with eyes/beaks.
* Focused (Password): Elements visible - birds with eyes looking at field; Resting positions - shifted right; Shapes unchanged.
* Typing (Password): Elements visible - birds stretched; Resting positions - center-left; Shapes elongated vertically.
* Hovered (Log in): Elements visible - birds happy expressions; Resting positions - left; Shapes eyes arcs, beaks up.
* Hovered (Google): Elements visible - birds bounced; Resting positions - up temporarily; Shapes squashed.
* Hovered (Sign up): Elements visible - birds reset; Resting positions - initial; Shapes happy.
* Transitions: Idle → Focused (Email) on focus input; Focused → Typing on type; Typing (Email) → Focused (Password) on tab/shift focus; Focused (Password) → Typing on type; Typing (Password) → Hovered (Log in) on mouse over button; Hovered (Log in) → Hovered (Google) on mouse move; Hovered (Google) → Hovered (Sign up) on mouse move.

1. IMPLEMENTATION HINTS

* Use SVG for bird shapes (path elements for bodies, circles for eyes, polygons for beaks); CSS for form elements (inputs as <input>, buttons as <button> with border-radius); Framer Motion or GSAP for animations (motion.div for positions, animate for transforms).
* Shape morphing REQUIRED for geometric to bird (use libraries like flubber or Kute.js for SVG path interpolation); Simple transforms for eye movement (translate on circle elements), scaling/bouncing (CSS scale/translate), rotations (CSS rotate); WebGL unnecessary unless for performance; Canvas alternative for complex morphs but SVG preferred for scalability.
