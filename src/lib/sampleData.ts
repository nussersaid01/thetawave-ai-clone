import { LectureData } from '@/types';

export const sampleLectures: LectureData[] = [
  {
    id: 'cs-neural-networks',
    title: 'CS 182: Deep Learning & Neural Network Backpropagation',
    subject: 'Computer Science & AI',
    folder: 'Semester 1 Core',
    duration: '48 mins',
    date: '2026-10-01',
    summary: 'Comprehensive analysis of multi-layer perceptrons, forward propagation mathematics, loss functions, and backpropagation via the chain rule with gradient descent optimization.',
    markdownNotes: `# CS 182: Deep Learning & Neural Network Foundations

## 1. Executive Summary
Neural networks function as universal function approximators capable of learning non-linear mappings from input space $\\mathcal{X}$ to output space $\\mathcal{Y}$. This lecture covers forward signal propagation, activation functions, cost metrics, and mathematical derivation of backpropagation using the multivariate chain rule.

---

## 2. Forward Signal Propagation
Each neuron in layer $l$ computes an affine transformation followed by a non-linear activation:

$$z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}$$
$$a^{[l]} = \\sigma(z^{[l]})$$

Where:
* $W^{[l]} \\in \\mathbb{R}^{n_l \\times n_{l-1}}$ is the weight matrix for layer $l$.
* $b^{[l]} \\in \\mathbb{R}^{n_l}$ is the bias vector.
* $a^{[0]} = x$ represents the input feature vector.
* $\\sigma(\\cdot)$ represents the non-linear activation function.

### Key Activation Functions Comparison
| Function | Formula | Derivative $\\sigma'(z)$ | Range | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Sigmoid** | $\\frac{1}{1 + e^{-z}}$ | $\\sigma(z)(1 - \\sigma(z))$ | $(0, 1)$ | Vanishing gradient problem in deep layers |
| **ReLU** | $\\max(0, z)$ | $1$ if $z > 0$ else $0$ | $[0, \\infty)$ | Computationally fast; prevents gradient decay |
| **GELU** | $z \\cdot \\Phi(z)$ | Smooth non-linearity | $(-0.17, \\infty)$ | Default in modern Transformers |

---

## 3. Loss Functions & Objective Formulation
For binary classification, we minimize the binary cross-entropy (negative log-likelihood) loss:

$$\\mathcal{L}(y, \\hat{y}) = -\\left[ y \\log(\\hat{y}) + (1 - y) \\log(1 - \\hat{y}) \\right]$$

For multi-class classification with $K$ classes:

$$\\mathcal{L}_{CE} = - \\sum_{k=1}^K y_k \\log(\\hat{y}_k), \\quad \\text{where } \\hat{y}_k = \\frac{e^{z_k}}{\\sum_{j=1}^K e^{z_j}}$$

---

## 4. Backpropagation Derivation
Backpropagation utilizes reverse-mode automatic differentiation. The error signal for the output layer $L$ is:

$$\\delta^{[L]} = \\frac{\\partial \\mathcal{L}}{\\partial z^{[L]}} = a^{[L]} - y$$

For hidden layers $l = L-1, \\dots, 1$, the recurrence relation is:

$$\\delta^{[l]} = \\left( (W^{[l+1]})^T \\delta^{[l+1]} \\right) \\odot \\sigma'(z^{[l]})$$

Weight and bias gradient updates:

$$\\frac{\\partial \\mathcal{L}}{\\partial W^{[l]}} = \\delta^{[l]} (a^{[l-1]})^T, \\quad \\frac{\\partial \\mathcal{L}}{\\partial b^{[l]}} = \\delta^{[l]}$$

---

## 5. Key Takeaways & Exam Tips
* Always normalize inputs to zero mean and unit variance ($z = \\frac{x - \\mu}{\\sigma}$) to prevent ill-conditioned Hessian loss landscapes.
* Use He initialization for ReLU activations: $W \\sim \\mathcal{N}\\left(0, \\sqrt{\\frac{2}{n_{in}}}\\right)$.
* Vanishing gradients occur when $|\\sigma'(z)| < 1$ repeatedly cascades through deep matrices.
`,
    mindmapMarkdown: `# Deep Learning & Neural Networks
## 1. Architecture
### Input Layer (x)
### Hidden Layers
#### Weights (W)
#### Biases (b)
#### Activations
##### ReLU (max(0, z))
##### Sigmoid (1 / (1 + e^-z))
##### GELU
### Output Layer
#### Softmax (Multi-class)
#### Sigmoid (Binary)
## 2. Forward Propagation
### Linear Transform: z = W*a + b
### Activation: a = sigma(z)
## 3. Loss Functions
### Cross-Entropy (Classification)
### MSE (Regression)
## 4. Backpropagation
### Chain Rule Error: delta = dL/dz
### Weight Gradient: dL/dW = delta * a^T
### Bias Gradient: dL/db = delta
### Optimizer: SGD / Adam
## 5. Optimization & Regularization
### He Initialization
### Batch Normalization
### Dropout
### Learning Rate Decay
`,
    flashcards: [
      {
        id: 'fc-1',
        front: 'What is the vanishing gradient problem and which activation function mitigates it?',
        back: 'The vanishing gradient problem occurs when backpropagated gradients shrink exponentially as they multiply through layers with derivatives < 1 (e.g. Sigmoid has max derivative 0.25). ReLU mitigates this because its derivative is exactly 1 for all positive inputs.',
        tag: 'Activations'
      },
      {
        id: 'fc-2',
        front: 'Write the recurrence relation for the error term delta in hidden layer l during backpropagation.',
        back: 'delta^[l] = ((W^[l+1])^T * delta^[l+1]) element-wise-multiplied with sigma\'(z^[l]).',
        tag: 'Mathematics'
      },
      {
        id: 'fc-3',
        front: 'Why is He (Kaiming) initialization preferred over Xavier for networks using ReLU activations?',
        back: 'ReLU zeroes out half the negative inputs on average (variance halved). He initialization compensates by using variance 2/n_in instead of 1/n_in, keeping signal variance stable across deep layers.',
        tag: 'Initialization'
      },
      {
        id: 'fc-4',
        front: 'What is the output gradient of Softmax combined with Cross-Entropy Loss?',
        back: 'dL/dz = p - y, which is simply the predicted probability distribution vector minus the one-hot target vector.',
        tag: 'Loss Functions'
      },
      {
        id: 'fc-5',
        front: 'What is the purpose of Batch Normalization during deep network training?',
        back: 'It normalizes layer inputs to zero mean and unit variance per mini-batch, reducing internal covariate shift, smoothing the optimization landscape, and enabling higher learning rates.',
        tag: 'Regularization'
      }
    ],
    quiz: [
      {
        id: 'qz-1',
        question: 'Which of the following activation functions has a maximum first derivative of 0.25, contributing heavily to vanishing gradients?',
        options: ['GELU', 'ReLU', 'Leaky ReLU', 'Sigmoid'],
        correctIndex: 3,
        explanation: 'The derivative of Sigmoid is sigma(z)*(1 - sigma(z)). At z=0, sigma(0)=0.5, giving 0.5 * 0.5 = 0.25, which is its maximum value.'
      },
      {
        id: 'qz-2',
        question: 'In standard backpropagation, what operation is performed between the incoming backpropagated error (W^T * delta) and the local activation derivative sigma\'(z)?',
        options: ['Matrix Multiplication', 'Hadamard (Element-wise) Product', 'Kronecker Product', 'Cross Product'],
        correctIndex: 1,
        explanation: 'The multivariate chain rule requires element-wise (Hadamard) multiplication between the mapped error vector and the local activation derivative.'
      },
      {
        id: 'qz-3',
        question: 'What is the recommended weight variance for He (Kaiming) normal initialization for a layer with n_in input neurons?',
        options: ['1 / n_in', '2 / n_in', '1 / (n_in + n_out)', '2 / (n_in + n_out)'],
        correctIndex: 1,
        explanation: 'He initialization sets Var(W) = 2 / n_in to account for the rectifying nature of ReLU which zeroes out approximately 50% of the activations.'
      },
      {
        id: 'qz-4',
        question: 'Why is Softmax paired with Cross-Entropy loss in multi-class classification?',
        options: [
          'It forces all weights to sum to 1',
          'Its combined gradient is remarkably simple: y_hat - y',
          'It guarantees zero training error on every step',
          'It completely eliminates the need for biases'
        ],
        correctIndex: 1,
        explanation: 'Combining Cross-Entropy with Softmax simplifies the derivative dramatically to (y_hat - y), providing strong, stable error signals during training.'
      }
    ]
  },
  {
    id: 'bio-cellular-respiration',
    title: 'BIO 101: Cellular Respiration & ATP Synthesis',
    subject: 'Biology & Biochemistry',
    folder: 'Midterm Prep',
    duration: '35 mins',
    date: '2026-09-28',
    summary: 'Exploration of Glycolysis, the Citric Acid Cycle, oxidative phosphorylation, and the chemiosmotic mechanism driven by ATP synthase across the mitochondrial inner membrane.',
    markdownNotes: `# BIO 101: Cellular Respiration & Energetics

## 1. Overview & Net Reaction
Cellular respiration is the catabolic pathway by which cells harvest chemical energy from glucose:

$$\\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\longrightarrow 6\\text{CO}_2 + 6\\text{H}_2\\text{O} + 30\\text{-}32\\text{ ATP}$$

The process occurs in 4 distinct stages:
1. **Glycolysis** (Cytoplasm)
2. **Pyruvate Oxidation** (Mitochondrial Matrix)
3. **Citric Acid (Krebs) Cycle** (Mitochondrial Matrix)
4. **Oxidative Phosphorylation** (Inner Mitochondrial Membrane)

---

## 2. ATP Yield Breakdown per Glucose Molecule
| Stage | Primary Substrates | Direct ATP | Reduced Coenzymes |
| :--- | :--- | :--- | :--- |
| **Glycolysis** | Glucose | 2 ATP (net) | 2 NADH |
| **Pyruvate Decarboxylation** | 2 Pyruvate | 0 ATP | 2 NADH |
| **Citric Acid Cycle** | 2 Acetyl-CoA | 2 GTP (ATP) | 6 NADH, 2 FADH$_2$ |
| **Oxidative Phosphorylation** | 10 NADH, 2 FADH$_2$ | ~26-28 ATP | H$_2$O byproduct |
`,
    mindmapMarkdown: `# Cellular Respiration
## 1. Glycolysis (Cytoplasm)
### Energy Investment (2 ATP used)
### Energy Payoff (4 ATP + 2 NADH)
### Net: 2 Pyruvate + 2 ATP + 2 NADH
## 2. Pyruvate Oxidation
### Entry to Matrix
### 2 Acetyl-CoA generated
### 2 CO2 released
## 3. Citric Acid Cycle (Matrix)
### Oxaloacetate + Acetyl-CoA -> Citrate
### Per glucose: 6 NADH, 2 FADH2, 2 GTP, 4 CO2
## 4. Oxidative Phosphorylation
### Electron Transport Chain (Complex I-IV)
### Proton Gradient (Intermembrane Space)
### Chemiosmosis via ATP Synthase
### Final Electron Acceptor: O2 -> H2O
`,
    flashcards: [
      {
        id: 'fc-bio-1',
        front: 'Where does glycolysis occur within an eukaryotic cell?',
        back: 'In the cytosol / cytoplasm (outside the mitochondria).',
        tag: 'Cellular Locations'
      },
      {
        id: 'fc-bio-2',
        front: 'What is the final electron acceptor in the mitochondrial electron transport chain?',
        back: 'Molecular Oxygen (O2), which is reduced to form water (H2O).',
        tag: 'Oxidative Phosphorylation'
      },
      {
        id: 'fc-bio-3',
        front: 'How many net ATP molecules are produced directly from Glycolysis per glucose molecule?',
        back: '2 net ATP (4 produced minus 2 consumed in the investment phase).',
        tag: 'Bioenergetics'
      }
    ],
    quiz: [
      {
        id: 'qz-bio-1',
        question: 'Which enzyme utilizes the proton motive force across the inner mitochondrial membrane to generate ATP from ADP and Pi?',
        options: ['Pyruvate kinase', 'ATP Synthase (Complex V)', 'Hexokinase', 'Phosphofructokinase'],
        correctIndex: 1,
        explanation: 'ATP Synthase (Complex V) couples the downhill flow of protons from the intermembrane space into the matrix with the synthesis of ATP.'
      }
    ]
  }
];

export const defaultFolders = [
  { id: 'fld-1', name: 'Semester 1 Core', color: '#6366f1', icon: 'Folder', createdAt: '2026-09-20' },
  { id: 'fld-2', name: 'Midterm Prep', color: '#f59e0b', icon: 'Folder', createdAt: '2026-09-25' },
  { id: 'fld-3', name: 'Research & Labs', color: '#10b981', icon: 'Folder', createdAt: '2026-09-30' },
];
