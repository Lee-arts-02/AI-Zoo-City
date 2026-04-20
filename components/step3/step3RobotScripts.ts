/** Central copy for Step 3 robot-only guidance. */

export const STEP3_OVERVIEW_ENTRY =
  "You can now click through the different districts to see what animals live in each one.";

export const STEP3_DISTRICT_NEAR_INFO =
  "You can click INFO to see more data about this district.";

export const STEP3_DISTRICT_NEAR_SORT_1 =
  "You can use this organizer to help you find patterns in this city.";

export const STEP3_ORGANIZER_COLOR =
  "First, find which animals appear in different districts, and use color to mark where you think each animal belongs.";

export const STEP3_ORGANIZER_DRAG_1 =
  "Now try dragging animals from the strip below. You may discover something interesting.";

export const STEP3_REVEAL_ASK =
  "Would you like to see more from the current Zoo City?";

export const STEP3_POST_REVEAL =
  "What interesting patterns do you notice when you compare districts?";

/** Sorting-machine bridge: pause (ms) after line 1 before line 2 types. */
export const STEP3_BRIDGE_SORTING_MACHINE_PAUSE_MS = 3000;

export const STEP3_BRIDGE_LINE_1 =
  "Do you want to know more about how the City Sorting Machine works?";

export const STEP3_BRIDGE_LINE_2 = "Let’s open the box!";

/** Stable array references for the robot guide. */
export const STEP3_SCRIPT_OVERVIEW = [STEP3_OVERVIEW_ENTRY] as const;
export const STEP3_SCRIPT_ORG_COLOR = [STEP3_ORGANIZER_COLOR] as const;
export const STEP3_SCRIPT_ORG_DRAG = [STEP3_ORGANIZER_DRAG_1] as const;
export const STEP3_SCRIPT_REVEAL_ASK = [STEP3_REVEAL_ASK] as const;
export const STEP3_SCRIPT_POST_REVEAL = [STEP3_POST_REVEAL] as const;
export const STEP3_SCRIPT_BRIDGE = [STEP3_BRIDGE_LINE_1, STEP3_BRIDGE_LINE_2] as const;

/** Bridge split: line 1 (overview), pause, then line 2 above Open Box. */
export const STEP3_SCRIPT_BRIDGE_LINE1 = [STEP3_BRIDGE_LINE_1] as const;
export const STEP3_SCRIPT_BRIDGE_LINE2 = [STEP3_BRIDGE_LINE_2] as const;

/** Pause after first bridge sentence before second line appears. */
export const STEP3_BRIDGE_GAP_AFTER_MS: [number] = [STEP3_BRIDGE_SORTING_MACHINE_PAUSE_MS];

/** After “Let’s open the box!” finishes typing, hold before hiding the robot. */
export const STEP3_BRIDGE_LINE2_HOLD_MS = 3000;

/** After post-reveal robot line finishes, wait before showing “Back to overview”. */
export const STEP3_POST_REVEAL_BACK_DELAY_MS = 3000;

export const STEP3_CHAR_MS = 28;
export const STEP3_BETWEEN_SENTENCES_MS = 650;
