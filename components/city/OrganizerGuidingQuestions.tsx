"use client";

export type OrganizerGuidingQuestionsProps = {
  visible: boolean;
};

export default function OrganizerGuidingQuestions({ visible }: OrganizerGuidingQuestionsProps) {
  if (!visible) return null;

  return (
    <div className="mt-3 rounded-xl border border-violet-200/80 bg-violet-50/80 px-3 py-3 text-sm leading-snug text-violet-950 shadow-sm">
      <p className="font-medium text-violet-900">Take a slow look</p>
      <ul className="mt-2 list-disc space-y-1.5 pl-4 marker:text-violet-500">
        <li>Do you notice any feature pattern in how the animals were classified?</li>
        <li>What size and diet patterns do you see when you compare district labels?</li>
      </ul>
    </div>
  );
}
