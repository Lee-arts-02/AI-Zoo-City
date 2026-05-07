/** Central copy for Step 3 robot-only guidance. */

export const STEP3_OVERVIEW_ENTRY =
  "Let's look at the old Zoo City. These animals were already placed into four districts. Look closely: do you notice any patterns?";

export const STEP3_DISTRICT_NEAR_INFO =
  "You can click INFO to see more data about this district.";

export const STEP3_DISTRICT_NEAR_SORT_1 =
  "You can use this organizer to find feature patterns in this city.";

export const STEP3_ORGANIZER_COLOR =
  "The organizer is a thinking tool. District colors stay with the animals so you can connect the chart back to the old city.";

export const STEP3_ORGANIZER_DRAG_1 =
  "Now sort animals by the two features the classifier can see: size and diet.";

export const STEP3_REVEAL_ASK =
  "Would you like to see more from the current Zoo City?";

export const STEP3_POST_REVEAL =
  "Old city pattern found: animals with similar size and diet were often placed in similar districts.";

/** Sorting-machine bridge: pause (ms) after line 1 before line 2 types. */
export const STEP3_BRIDGE_SORTING_MACHINE_PAUSE_MS = 3000;

export const STEP3_BRIDGE_LINE_1 =
  "You found an old city pattern. In the past, animals with similar size and diet were often placed in similar districts.";

export const STEP3_BRIDGE_LINE_2 =
  "Now let's open the classifier and see how it learned from these past placements.";

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

export const STEP3_CHAR_MS = 34;
export const STEP3_BETWEEN_SENTENCES_MS = 800;
