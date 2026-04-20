export type DialogueKind =
  | "narration"
  | "concept"
  | "question"
  | "nav"
  | "interaction"
  | "invitation";

export type DialogueLine = { text: string; kind: DialogueKind; key: string };

export function welcomeFeedbackText(q: string | null): string {
  if (q === "patterns") {
    return "Yes. That is the big idea.\nThis system works by using patterns in data.";
  }
  if (q === "brain") {
    return "It can seem that way sometimes.\nBut this system does not think like a human brain.\nLet’s look inside and see what it really uses.";
  }
  if (q === "magic") {
    return "It may feel magical, but it is not magic.\nIt follows patterns it learned from examples.";
  }
  if (q === "secret") {
    return "People can design the system, but they do not secretly choose every answer one by one.\nThe system follows learned patterns to make its guess.";
  }
  return "Patterns from examples are the core idea.";
}

export function tokWhyFeedback(q: string | null): string {
  if (q === "pieces") {
    return "Exactly! That way, it can go step by step.";
  }
  if (q === "pretty") {
    return "Hmm, not really. It's not trying to make your sentence prettier. It just needs smaller pieces to go step by step.";
  }
  if (q === "long") {
    return "Not exactly. Long sentences are okay! The system breaks them into smaller pieces so it can process them step by step.";
  }
  return "Small pieces are easier to match to patterns.";
}

export function patFeedback(q: string | null): string {
  if (q === "seen") {
    return "Exactly! It matters when the system has seen it show up like this before.";
  }
  if (q === "magic") {
    return "Haha, not magic 😄 It changes the guess because the system has seen patterns like this before.";
  }
  if (q === "whole") {
    return "Not quite. One piece isn't the whole story — but it can still nudge the guess if the system has seen it connected to certain roles before."
  }
  return "What the system has seen before can change how it leans.";
}

export function oneClueFeedback(q: string | null): string {
  if (q === "seen") {
    return "Nice catch 👀 A token can matter more when the system has seen it linked with certain roles before.";
  }
  if (q === "want") {
    return "That would be nice, but the system does not truly know what you want. It is using learned patterns, not personal understanding.";
  }
  if (q === "fair") {
    return "Fairness is something people need to think about carefully. The system does not automatically know what is fair.\nIt follows patterns it learned from earlier examples.";
  }
  return "Nice catch 👀 Earlier examples shape how a clue pulls the guess.";
}

export function comb1Feedback(q: string | null): string {
  if (q === "diff") {
    return "Exactly! Different tokens can push the guess in different directions.";
  }
  if (q === "same") {
    return "Hmm, look again 👀 If every token mattered the same, the guess would always move the same way. But it doesn't, right?"
  }
  if (q === "random") {
    return "It might look jumpy, but it's not random. The guess changes because each token pulls it differently.";
  }
  return "Influence varies by tokens.";
}

export function predFeedback(q: string | null): string {
  if (q === "prob") {
    return "Exactly! It is making a guess based on probability.";
  }
  if (q === "future") {
    return "Not quite. A prediction is not the same as a final decision. It is only a guess about what seems more likely.";
  }
  if (q === "true") {
    return "Not exactly. The system is not discovering your true self. It is comparing tokens and patterns to make a guess.";
  }
  return "Think of it as a likelihood, not a verdict.";
}

export function city1Feedback(q: string | null): string {
  if (q === "repeat") {
    return "Yes! Repeated guesses can create repeated city patterns.";
  }
  if (q === "mixed") {
    return "That would be nice, but it does not always happen. If the same kinds of guesses are repeated, neighborhoods can start to look more and more alike.";
  }
  if (q === "random") {
    return "Not quite. The problem is usually not randomness. The problem is repetition.";
  }
  return "Patterns can echo across the map.";
}
