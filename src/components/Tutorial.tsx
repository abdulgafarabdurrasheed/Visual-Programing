import React, { useState, useEffect } from 'react';
import type { NodeData } from '../types';
import './Tutorial.css';

interface TutorialProps {
  nodes: NodeData[];
  onComplete: () => void;
  onLoadDemo: () => void;
  onSkip: () => void;
}

interface TutorialStep {
  icon: string;
  iconBg: string;
  title: string;
  body: React.ReactNode;
  waitFor?: string; // node type to wait for on canvas
  freeInteract?: boolean; // if true, dock card to corner so user can interact with canvas
  buttonLabel?: string;
  buttonType?: 'primary' | 'success';
}

const Tutorial: React.FC<TutorialProps> = ({ nodes, onComplete, onLoadDemo, onSkip }) => {
  const [step, setStep] = useState(0);
  const [stepSatisfied, setStepSatisfied] = useState(false);

  const steps: TutorialStep[] = [
    // Step 0: Welcome
    {
      icon: '🚀',
      iconBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      title: 'Welcome to NodeScript!',
      body: (
        <div className="tutorial-text">
          <strong>NodeScript</strong> is a visual programming environment where you build programs 
          by connecting nodes together — no typing code required.
          <br /><br />
          Each <strong>node</strong> performs a specific action: math, logic, printing output, 
          and more. You connect them with <strong>wires</strong> to define the flow of your program.
          <br /><br />
          Let's walk through the basics together.
        </div>
      ),
      buttonLabel: "Let's get started →",
      buttonType: 'primary',
    },

    // Step 1: Start node
    {
      icon: '🎯',
      iconBg: 'linear-gradient(135deg, #10b981, #34d399)',
      title: 'The Start Node',
      body: (
        <div className="tutorial-text">
          Every program needs a beginning. The{' '}
          <span className="tutorial-highlight" style={{ background: '#10b98120', color: '#10b981' }}>
            Start Program
          </span>{' '}
          node is where execution begins — when you click <strong>▶ RUN</strong>, 
          the interpreter starts here and follows the wires forward.
          <br /><br />
          <strong>Click "Start Program"</strong> in the sidebar on the left, or drag it onto the canvas.
        </div>
      ),
      waitFor: 'start',
    },

    // Step 2: Add node
    {
      icon: '🔢',
      iconBg: 'linear-gradient(135deg, #6366f1, #818cf8)',
      title: 'The Add Node',
      body: (
        <div className="tutorial-text">
          The{' '}
          <span className="tutorial-highlight" style={{ background: '#6366f120', color: '#6366f1' }}>
            Add
          </span>{' '}
          node takes two numbers (<strong>A</strong> and <strong>B</strong>) and outputs their sum. 
          You can type values directly into the inputs on the node, or connect other nodes to feed data in.
          <br /><br />
          <strong>Click "Add"</strong> in the <strong>Math</strong> category in the sidebar.
        </div>
      ),
      waitFor: 'add',
    },

    // Step 3: Print node
    {
      icon: '💬',
      iconBg: 'linear-gradient(135deg, #22d3ee, #67e8f9)',
      title: 'The Print Node',
      body: (
        <div className="tutorial-text">
          The{' '}
          <span className="tutorial-highlight" style={{ background: '#22d3ee20', color: '#22d3ee' }}>
            Print
          </span>{' '}
          node displays a value in the <strong>Console</strong> panel at the bottom. 
          Whatever you connect to its <strong>Message</strong> input will appear as output when the program runs.
          <br /><br />
          <strong>Click "Print"</strong> in the <strong>Input/Output</strong> category in the sidebar.
        </div>
      ),
      waitFor: 'print',
    },

    // Step 4: Connect & Run
    {
      icon: '🔗',
      iconBg: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
      title: 'Connect & Run!',
      body: (
        <div className="tutorial-text">
          Now wire them together:
          <br /><br />
          <strong>1.</strong> Drag from <strong>Start</strong>'s Exec output <span style={{ color: '#f59e0b' }}>▶</span> to <strong>Print</strong>'s Exec input — this tells the program to run Print after Start.
          <br /><br />
          <strong>2.</strong> Drag from <strong>Add</strong>'s Result output <span style={{ color: '#6366f1' }}>●</span> to <strong>Print</strong>'s Message input — this sends the sum to Print.
          <br /><br />
          <strong>3.</strong> Set some values in Add's <strong>A</strong> and <strong>B</strong> fields.
          <br /><br />
          <strong>4.</strong> Click <span style={{ color: '#10b981', fontWeight: 700 }}>▶ RUN</span> in the toolbar and check the Console!
        </div>
      ),
      buttonLabel: 'I did it! →',
      buttonType: 'primary',
      freeInteract: true,
    },

    // Step 5: Conclusion + Load Demo
    {
      icon: '🎉',
      iconBg: 'linear-gradient(135deg, #f43f5e, #fb7185)',
      title: "You've Got the Basics!",
      body: (
        <div className="tutorial-text">
          That's the core of NodeScript — <strong>drag nodes, wire them together, and run</strong>.
          <br /><br />
          There's a lot more to explore: <strong>variables</strong>, <strong>loops</strong>, <strong>conditionals</strong>, 
          <strong> arrays</strong>, and more. You'll find all of them in the sidebar.
          <br /><br />
          Here's a demo program that <strong>sums all numbers from 1 to 10</strong>. 
          Hit RUN and study how the nodes are connected to understand the flow!
        </div>
      ),
      buttonLabel: 'Load Demo →',
      buttonType: 'success',
    },
  ];

  const current = steps[step];
  const isWaiting = !!current.waitFor && !stepSatisfied;
  const needsCanvas = isWaiting || !!current.freeInteract;

  // Watch for required node dropping onto canvas
  useEffect(() => {
    if (!current.waitFor) {
      setStepSatisfied(false);
      return;
    }
    const found = nodes.some(n => n.type === current.waitFor);
    if (found && !stepSatisfied) {
      setStepSatisfied(true);
    }
  }, [nodes, current.waitFor, stepSatisfied]);

  // Auto-advance after node detected (small delay for satisfaction)
  useEffect(() => {
    if (stepSatisfied && current.waitFor) {
      const timer = setTimeout(() => {
        setStep(prev => prev + 1);
        setStepSatisfied(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [stepSatisfied, current.waitFor]);

  const handleNext = () => {
    if (step === steps.length - 1) {
      // Last step — load demo
      onLoadDemo();
      markComplete();
      onComplete();
      return;
    }
    setStep(prev => prev + 1);
    setStepSatisfied(false);
  };

  const markComplete = () => {
    try { localStorage.setItem('nodescript_tutorial_done', '1'); } catch {}
  };

  const handleSkip = () => {
    markComplete();
    onSkip();
  };

  return (
    <>
      {/* Backdrop — only blocks clicks when user doesn't need canvas */}
      {!needsCanvas && (
        <div className="tutorial-overlay" />
      )}

      {/* Card — docks to bottom-right when user needs canvas access */}
      <div
        className="tutorial-card"
        style={needsCanvas ? {
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 2001,
          animation: 'tutSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        } : {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2001,
          animation: 'tutSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Header */}
        <div className="tutorial-header">
          <div className="tutorial-icon" style={{ background: current.iconBg }}>
            {current.icon}
          </div>
          <div>
            <div className="tutorial-step-label">
              Step {step + 1} of {steps.length}
            </div>
            <div className="tutorial-title">{current.title}</div>
          </div>
        </div>

        {/* Body */}
        <div className="tutorial-body">
          {current.body}

          {/* Waiting indicator */}
          {isWaiting && (
            <div className="tutorial-waiting">
              <div className="tutorial-waiting-dot" />
              <span className="tutorial-waiting-text">
                Waiting for you to add the node...
              </span>
            </div>
          )}

          {/* Success checkmark when node detected */}
          {stepSatisfied && current.waitFor && (
            <div className="tutorial-checkmark">
              <span style={{ color: '#10b981', fontSize: 16 }}>✓</span>
              <span style={{ color: '#10b981' }}>Node detected on canvas!</span>
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div className="tutorial-progress">
          {steps.map((_, i) => (
            <div
              key={i}
              className="tutorial-dot"
              style={{
                background: i < step ? '#10b981' : i === step ? '#6366f1' : '#2a2a4a',
                width: i === step ? 20 : 6,
                borderRadius: i === step ? 3 : 50,
              }}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="tutorial-footer">
          <button className="tutorial-btn tutorial-btn-skip" onClick={handleSkip}>
            Skip Tutorial
          </button>

          {!isWaiting && current.buttonLabel && (
            <button
              className={`tutorial-btn ${current.buttonType === 'success' ? 'tutorial-btn-success' : 'tutorial-btn-primary'}`}
              onClick={handleNext}
            >
              {current.buttonLabel}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Tutorial;
