'use client';

import { Children, cloneElement, isValidElement, useId, useState, type ReactElement, type ReactNode } from 'react';

type Choice = 'A' | 'B' | 'C' | 'D';
interface SourceElementProps { className?: string; children?: ReactNode }
/** 原本由来のReact要素かどうかを判定し、props型を絞り込む。 */
const isSourceElement = (node: ReactNode): node is ReactElement<SourceElementProps> => isValidElement<SourceElementProps>(node);

/** Enhance the original question nodes without rewriting their text or emphasis. */
export function QuizCard({ number, correctAnswer, children }: {
  number: number;
  correctAnswer: Choice;
  children: ReactNode;
}) {
  const [selected, setSelected] = useState<Choice | null>(null);
  const [expanded, setExpanded] = useState(false);
  const feedbackId = `issep-quiz-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const correct = selected === correctAnswer;
  const feedback = selected !== null && <p className="quiz-feedback" id={feedbackId} role="status" data-result={correct ? 'correct' : 'incorrect'}>
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" />
      <path d={correct ? 'm8 12 3 3 5-6' : 'm9 9 6 6m0-6-6 6'} />
    </svg>
    <span>{correct ? '正解' : '不正解'}</span>
  </p>;

  return <div className="quiz" aria-label={`問 ${number}`} data-answer-state={selected ? (correct ? 'correct' : 'incorrect') : undefined}>
    {Children.map(children, node => {
      if (!isSourceElement(node)) return node;
      if (node.props.className === 'q-opts') {
        let index = 0;
        const options = cloneElement(node, {}, Children.map(node.props.children, option => {
          if (!isSourceElement(option)) return option;
          const choice = String.fromCharCode(65 + index++) as Choice;
          const state = selected === null ? undefined : choice === correctAnswer ? 'correct' : choice === selected ? 'incorrect' : undefined;
          return cloneElement(option, {}, <button
            type="button"
            className="quiz-choice"
            aria-pressed={selected === choice}
            aria-describedby={selected === choice ? feedbackId : undefined}
            data-choice-state={state}
            onClick={() => { setSelected(choice); setExpanded(true); }}
          >{option.props.children}</button>);
        }));
        return <>{options}{feedback}</>;
      }
      if (node.type === 'details') {
        return cloneElement(node as ReactElement<React.ComponentProps<'details'>>, {
          open: expanded,
          onToggle: event => { if (event.currentTarget.open !== expanded) setExpanded(event.currentTarget.open); },
        });
      }
      return node;
    })}
  </div>;
}
