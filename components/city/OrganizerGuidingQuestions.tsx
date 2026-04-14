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
        <li>Do you notice any pattern in how you sorted the animals?</li>
        <li>What other interesting facts do you see when you compare districts?</li>
      </ul>
    </div>
  );
}
