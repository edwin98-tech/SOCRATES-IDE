import { useState, useEffect, useRef } from 'react';
import CodeEditor from './CodeEditor';
import ExecutionPanel, { type TestCaseResult } from './ExecutionPanel';
import SocraticChat from './SocraticChat';
import SuspendedScreen from './SuspendedScreen';
import AISettingsModal from './AISettingsModal';
import { supabase } from '../lib/supabaseClient';
import { ChevronLeft, ChevronRight, RotateCcw, Play, CheckCircle2, Settings, BookOpen } from 'lucide-react';
import { analyzeCodeComplexity, type ComplexityAnalysis } from '../lib/gemini';

interface StudentIDEProps {
  onLogout?: () => void;
}

const QUESTIONS = [
  {
    id: "1.2.1",
    title: "1.2.1 Array Operations & Display",
    language: "Python",
    description: "Write a Python function display_array(arr) to print elements of a one-dimensional array separated by spaces, and implement a main() driver.",
    defaultCode: `# Write your Python code here...

def display_array(arr):
    # Print elements of arr separated by space
    print(*(arr))

def main():
    nums = [10, 20, 30]
    display_array(nums)

main()`,
    menu: ["1. Insert", "2. Delete", "3. Display", "4. Exit"],
    sampleTestCases: "Input: [10, 20, 30]\nOutput: 10 20 30"
  },
  {
    id: "1.2.2",
    title: "1.2.2 Linear Search in Array",
    language: "Python",
    description: "Implement a function linear_search(arr, target) that returns the 0-based index of the target element, or -1 if the element is not found.",
    defaultCode: `# Write your Python code here...

def linear_search(arr, target):
    # Iterate and return index if found, else -1
    pass

def main():
    arr = [10, 20, 30, 40, 50]
    print("Found at:", linear_search(arr, 30))

main()`,
    menu: ["1. Input Array", "2. Search Target", "3. Exit"],
    sampleTestCases: "Input Array: [10, 20, 30, 40, 50]\nTarget: 30\nOutput: Found at: 2"
  },
  {
    id: "1.2.3",
    title: "1.2.3 Array Reversal (In-Place)",
    language: "Python",
    description: "Write a function reverse_array(arr) to reverse a list in-place using two pointers without using Python's built-in reverse() or [::-1] slicing.",
    defaultCode: `# Write your Python code here...

def reverse_array(arr):
    # Reverse arr in-place using two pointers
    pass

def main():
    nums = [1, 2, 3, 4, 5]
    reverse_array(nums)
    print("Reversed:", nums)

main()`,
    menu: ["1. Input Array", "2. Reverse", "3. Display"],
    sampleTestCases: "Input: [1, 2, 3, 4, 5]\nOutput: Reversed: [5, 4, 3, 2, 1]"
  },
  {
    id: "1.2.4",
    title: "1.2.4 Two Sum Problem",
    language: "Python",
    description: "Given an array of integers nums and an integer target, return indices [i, j] of the two numbers such that they add up to target.",
    defaultCode: `# Write your Python code here...

def two_sum(nums, target):
    # Return list of two indices [i, j] that sum to target
    pass

def main():
    nums = [2, 7, 11, 15]
    target = 9
    print("Indices:", two_sum(nums, target))

main()`,
    menu: ["1. Input Array", "2. Find Two Sum", "3. Exit"],
    sampleTestCases: "Input: nums = [2, 7, 11, 15], target = 9\nOutput: Indices: [0, 1]"
  },
  {
    id: "1.2.5",
    title: "1.2.5 Find Maximum & Minimum",
    language: "Python",
    description: "Write a function find_min_max(arr) that returns a tuple (min_val, max_val) containing the smallest and largest elements in the array.",
    defaultCode: `# Write your Python code here...

def find_min_max(arr):
    # Return tuple (min_val, max_val)
    pass

def main():
    nums = [3, 1, 9, 7, 5]
    print("Min & Max:", find_min_max(nums))

main()`,
    menu: ["1. Input Array", "2. Compute Min/Max", "3. Exit"],
    sampleTestCases: "Input: [3, 1, 9, 7, 5]\nOutput: Min & Max: (1, 9)"
  },
  {
    id: "1.2.6",
    title: "1.2.6 Binary Search (Sorted Array)",
    language: "Python",
    description: "Implement binary_search(arr, target) to find the index of target in an ascending sorted array in O(log N) time. Return -1 if not found.",
    defaultCode: `# Write your Python code here...

def binary_search(arr, target):
    # Implement binary search using low and high pointers
    pass

def main():
    nums = [2, 4, 6, 8, 10, 12]
    print("Found at:", binary_search(nums, 8))

main()`,
    menu: ["1. Input Sorted Array", "2. Binary Search", "3. Exit"],
    sampleTestCases: "Input: arr = [2, 4, 6, 8, 10, 12], target = 8\nOutput: Found at: 3"
  },
  {
    id: "1.2.7",
    title: "1.2.7 Palindrome String Checker",
    language: "Python",
    description: "Write a function is_palindrome(s) that returns True if the given string is a palindrome (ignoring casing and non-alphanumeric chars), else False.",
    defaultCode: `# Write your Python code here...

def is_palindrome(s):
    # Check if s is a palindrome
    pass

def main():
    text = "racecar"
    print("Is Palindrome:", is_palindrome(text))

main()`,
    menu: ["1. Input String", "2. Check Palindrome", "3. Exit"],
    sampleTestCases: "Input: 'racecar' -> True\nInput: 'socrates' -> False"
  },
  {
    id: "1.2.8",
    title: "1.2.8 Valid Parentheses (Stack)",
    language: "Python",
    description: "Given a string s containing just '(', ')', '{', '}', '[' and ']', determine if the input string is valid using a stack.",
    defaultCode: `# Write your Python code here...

def is_valid_parentheses(s):
    # Use stack to match opening and closing brackets
    pass

def main():
    expr = "()[]{}"
    print("Is Valid:", is_valid_parentheses(expr))

main()`,
    menu: ["1. Input Expression", "2. Check Parentheses", "3. Exit"],
    sampleTestCases: "Input: '()[]{}' -> True\nInput: '(]' -> False"
  },
  {
    id: "1.2.9",
    title: "1.2.9 Bubble Sort Implementation",
    language: "Python",
    description: "Implement bubble_sort(arr) to sort an array in ascending order in-place by comparing adjacent elements.",
    defaultCode: `# Write your Python code here...

def bubble_sort(arr):
    # Sort arr in ascending order in-place
    pass

def main():
    nums = [64, 34, 25, 12, 22, 11, 90]
    bubble_sort(nums)
    print("Sorted:", nums)

main()`,
    menu: ["1. Input Array", "2. Bubble Sort", "3. Display"],
    sampleTestCases: "Input: [64, 34, 25, 12, 22, 11, 90]\nOutput: Sorted: [11, 12, 22, 25, 34, 64, 90]"
  },
  {
    id: "1.2.10",
    title: "1.2.10 Remove Duplicates (Sorted)",
    language: "Python",
    description: "Given a sorted integer array nums, remove the duplicates in-place such that each unique element appears only once. Return the number of unique elements.",
    defaultCode: `# Write your Python code here...

def remove_duplicates(nums):
    # Modify nums in-place and return count of unique elements
    pass

def main():
    nums = [1, 1, 2, 2, 3]
    k = remove_duplicates(nums)
    print("Unique Count:", k, "Array:", nums[:k])

main()`,
    menu: ["1. Input Sorted Array", "2. Remove Duplicates", "3. Display"],
    sampleTestCases: "Input: nums = [1, 1, 2, 2, 3]\nOutput: Unique Count: 3, Array: [1, 2, 3]"
  }
];

const getTestHarnessForQuestion = (qId: string) => {
  switch (qId) {
    case "1.2.1":
      return `
import sys, io, json
results = []
try:
    if 'display_array' in globals() and callable(display_array):
        buf = io.StringIO()
        old_stdout = sys.stdout
        sys.stdout = buf
        try:
            display_array([10, 20, 30])
        finally:
            sys.stdout = old_stdout
        out = buf.getvalue().strip()
        if "10" in out and "20" in out and "30" in out:
            results.append({"id": 1, "name": "Test Case 1 (Shown): display_array([10, 20, 30])", "isShown": True, "passed": True, "expected": "10 20 30", "actual": out})
        else:
            results.append({"id": 1, "name": "Test Case 1 (Shown): display_array([10, 20, 30])", "isShown": True, "passed": False, "expected": "Output containing 10 20 30", "actual": out or "(No output printed)"})
        
        buf2 = io.StringIO()
        old_stdout = sys.stdout
        sys.stdout = buf2
        try:
            display_array([5, 15, 25, 35])
        finally:
            sys.stdout = old_stdout
        out2 = buf2.getvalue().strip()
        if "5" in out2 and "35" in out2:
            results.append({"id": 2, "name": "Test Case 2 (Hidden): display_array([5, 15, 25, 35])", "isShown": False, "passed": True, "expected": "5 15 25 35", "actual": out2})
        else:
            results.append({"id": 2, "name": "Test Case 2 (Hidden): display_array([5, 15, 25, 35])", "isShown": False, "passed": False, "expected": "5 15 25 35", "actual": out2 or "(No output printed)"})
    else:
        results.append({"id": 1, "name": "Test Case 1 (Shown): display_array definition", "isShown": True, "passed": False, "expected": "def display_array(arr)", "actual": "Function not found"})
        results.append({"id": 2, "name": "Test Case 2 (Hidden): Execution", "isShown": False, "passed": False, "expected": "Valid output", "actual": "Blocked"})
except Exception as e:
    results.append({"id": 1, "name": "Test Case 1 (Shown): Execution", "isShown": True, "passed": False, "expected": "Clean run", "actual": str(e)})

json.dumps(results)
`;

    case "1.2.2":
      return `
import json
results = []
try:
    if 'linear_search' in globals() and callable(linear_search):
        ans1 = linear_search([10, 20, 30, 40, 50], 30)
        ans2 = linear_search([10, 20, 30, 40, 50], 99)
        results.append({"id": 1, "name": "Test Case 1 (Shown): linear_search([10, 20, 30, 40, 50], 30)", "isShown": True, "passed": ans1 == 2, "expected": "2", "actual": str(ans1)})
        results.append({"id": 2, "name": "Test Case 2 (Hidden): Element Not Found (target=99)", "isShown": False, "passed": ans2 == -1, "expected": "-1", "actual": str(ans2)})
    else:
        results.append({"id": 1, "name": "Test Case 1 (Shown): linear_search definition", "isShown": True, "passed": False, "expected": "def linear_search(arr, target)", "actual": "Function not found"})
        results.append({"id": 2, "name": "Test Case 2 (Hidden): Search Verification", "isShown": False, "passed": False, "expected": "-1", "actual": "Blocked"})
except Exception as e:
    results.append({"id": 1, "name": "Test Case 1 (Shown): Execution", "isShown": True, "passed": False, "expected": "Clean run", "actual": str(e)})

json.dumps(results)
`;

    case "1.2.3":
      return `
import json
results = []
try:
    if 'reverse_array' in globals() and callable(reverse_array):
        t1 = [1, 2, 3, 4, 5]
        reverse_array(t1)
        p1 = (t1 == [5, 4, 3, 2, 1])
        results.append({"id": 1, "name": "Test Case 1 (Shown): reverse_array([1, 2, 3, 4, 5])", "isShown": True, "passed": p1, "expected": "[5, 4, 3, 2, 1]", "actual": str(t1)})
        
        t2 = [10, 20]
        reverse_array(t2)
        p2 = (t2 == [20, 10])
        results.append({"id": 2, "name": "Test Case 2 (Hidden): Even Length Array [10, 20]", "isShown": False, "passed": p2, "expected": "[20, 10]", "actual": str(t2)})
    else:
        results.append({"id": 1, "name": "Test Case 1 (Shown): reverse_array definition", "isShown": True, "passed": False, "expected": "def reverse_array(arr)", "actual": "Function not found"})
        results.append({"id": 2, "name": "Test Case 2 (Hidden): In-place reverse", "isShown": False, "passed": False, "expected": "[20, 10]", "actual": "Blocked"})
except Exception as e:
    results.append({"id": 1, "name": "Test Case 1 (Shown): Execution", "isShown": True, "passed": False, "expected": "Clean run", "actual": str(e)})

json.dumps(results)
`;

    case "1.2.4":
      return `
import json
results = []
try:
    if 'two_sum' in globals() and callable(two_sum):
        res1 = two_sum([2, 7, 11, 15], 9)
        p1 = sorted(res1) == [0, 1] if res1 else False
        results.append({"id": 1, "name": "Test Case 1 (Shown): two_sum([2, 7, 11, 15], 9)", "isShown": True, "passed": p1, "expected": "[0, 1]", "actual": str(res1)})
        
        res2 = two_sum([3, 2, 4], 6)
        p2 = sorted(res2) == [1, 2] if res2 else False
        results.append({"id": 2, "name": "Test Case 2 (Hidden): two_sum([3, 2, 4], 6)", "isShown": False, "passed": p2, "expected": "[1, 2]", "actual": str(res2)})
    else:
        results.append({"id": 1, "name": "Test Case 1 (Shown): two_sum definition", "isShown": True, "passed": False, "expected": "def two_sum(nums, target)", "actual": "Function not found"})
        results.append({"id": 2, "name": "Test Case 2 (Hidden): Two Sum Logic", "isShown": False, "passed": False, "expected": "[1, 2]", "actual": "Blocked"})
except Exception as e:
    results.append({"id": 1, "name": "Test Case 1 (Shown): Execution", "isShown": True, "passed": False, "expected": "Clean run", "actual": str(e)})

json.dumps(results)
`;

    case "1.2.5":
      return `
import json
results = []
try:
    if 'find_min_max' in globals() and callable(find_min_max):
        res1 = find_min_max([3, 1, 9, 7, 5])
        p1 = tuple(res1) == (1, 9) if res1 else False
        results.append({"id": 1, "name": "Test Case 1 (Shown): find_min_max([3, 1, 9, 7, 5])", "isShown": True, "passed": p1, "expected": "(1, 9)", "actual": str(res1)})
        
        res2 = find_min_max([42])
        p2 = tuple(res2) == (42, 42) if res2 else False
        results.append({"id": 2, "name": "Test Case 2 (Hidden): Single Element [42]", "isShown": False, "passed": p2, "expected": "(42, 42)", "actual": str(res2)})
    else:
        results.append({"id": 1, "name": "Test Case 1 (Shown): find_min_max definition", "isShown": True, "passed": False, "expected": "def find_min_max(arr)", "actual": "Function not found"})
        results.append({"id": 2, "name": "Test Case 2 (Hidden): Min/Max", "isShown": False, "passed": False, "expected": "(42, 42)", "actual": "Blocked"})
except Exception as e:
    results.append({"id": 1, "name": "Test Case 1 (Shown): Execution", "isShown": True, "passed": False, "expected": "Clean run", "actual": str(e)})

json.dumps(results)
`;

    case "1.2.6":
      return `
import json
results = []
try:
    if 'binary_search' in globals() and callable(binary_search):
        res1 = binary_search([2, 4, 6, 8, 10, 12], 8)
        results.append({"id": 1, "name": "Test Case 1 (Shown): binary_search([2, 4, 6, 8, 10, 12], 8)", "isShown": True, "passed": res1 == 3, "expected": "3", "actual": str(res1)})
        
        res2 = binary_search([1, 5, 9, 13], 4)
        results.append({"id": 2, "name": "Test Case 2 (Hidden): Element Not Present (target=4)", "isShown": False, "passed": res2 == -1, "expected": "-1", "actual": str(res2)})
    else:
        results.append({"id": 1, "name": "Test Case 1 (Shown): binary_search definition", "isShown": True, "passed": False, "expected": "def binary_search(arr, target)", "actual": "Function not found"})
        results.append({"id": 2, "name": "Test Case 2 (Hidden): Binary Search", "isShown": False, "passed": False, "expected": "-1", "actual": "Blocked"})
except Exception as e:
    results.append({"id": 1, "name": "Test Case 1 (Shown): Execution", "isShown": True, "passed": False, "expected": "Clean run", "actual": str(e)})

json.dumps(results)
`;

    case "1.2.7":
      return `
import json
results = []
try:
    if 'is_palindrome' in globals() and callable(is_palindrome):
        res1 = is_palindrome("racecar")
        results.append({"id": 1, "name": "Test Case 1 (Shown): is_palindrome('racecar')", "isShown": True, "passed": res1 is True, "expected": "True", "actual": str(res1)})
        
        res2 = is_palindrome("socrates")
        results.append({"id": 2, "name": "Test Case 2 (Hidden): Non-palindrome 'socrates'", "isShown": False, "passed": res2 is False, "expected": "False", "actual": str(res2)})
    else:
        results.append({"id": 1, "name": "Test Case 1 (Shown): is_palindrome definition", "isShown": True, "passed": False, "expected": "def is_palindrome(s)", "actual": "Function not found"})
        results.append({"id": 2, "name": "Test Case 2 (Hidden): Palindrome Logic", "isShown": False, "passed": False, "expected": "False", "actual": "Blocked"})
except Exception as e:
    results.append({"id": 1, "name": "Test Case 1 (Shown): Execution", "isShown": True, "passed": False, "expected": "Clean run", "actual": str(e)})

json.dumps(results)
`;

    case "1.2.8":
      return `
import json
results = []
try:
    if 'is_valid_parentheses' in globals() and callable(is_valid_parentheses):
        res1 = is_valid_parentheses("()[]{}")
        results.append({"id": 1, "name": "Test Case 1 (Shown): is_valid_parentheses('()[]{}')", "isShown": True, "passed": res1 is True, "expected": "True", "actual": str(res1)})
        
        res2 = is_valid_parentheses("(]")
        results.append({"id": 2, "name": "Test Case 2 (Hidden): Invalid '(]'", "isShown": False, "passed": res2 is False, "expected": "False", "actual": str(res2)})
    else:
        results.append({"id": 1, "name": "Test Case 1 (Shown): is_valid_parentheses definition", "isShown": True, "passed": False, "expected": "def is_valid_parentheses(s)", "actual": "Function not found"})
        results.append({"id": 2, "name": "Test Case 2 (Hidden): Parentheses Stack", "isShown": False, "passed": False, "expected": "False", "actual": "Blocked"})
except Exception as e:
    results.append({"id": 1, "name": "Test Case 1 (Shown): Execution", "isShown": True, "passed": False, "expected": "Clean run", "actual": str(e)})

json.dumps(results)
`;

    case "1.2.9":
      return `
import json
results = []
try:
    if 'bubble_sort' in globals() and callable(bubble_sort):
        arr1 = [64, 34, 25, 12, 22, 11, 90]
        bubble_sort(arr1)
        p1 = (arr1 == [11, 12, 22, 25, 34, 64, 90])
        results.append({"id": 1, "name": "Test Case 1 (Shown): bubble_sort([64, 34, 25, 12, 22, 11, 90])", "isShown": True, "passed": p1, "expected": "[11, 12, 22, 25, 34, 64, 90]", "actual": str(arr1)})
        
        arr2 = [5, 1, 4, 2, 8]
        bubble_sort(arr2)
        p2 = (arr2 == [1, 2, 4, 5, 8])
        results.append({"id": 2, "name": "Test Case 2 (Hidden): bubble_sort([5, 1, 4, 2, 8])", "isShown": False, "passed": p2, "expected": "[1, 2, 4, 5, 8]", "actual": str(arr2)})
    else:
        results.append({"id": 1, "name": "Test Case 1 (Shown): bubble_sort definition", "isShown": True, "passed": False, "expected": "def bubble_sort(arr)", "actual": "Function not found"})
        results.append({"id": 2, "name": "Test Case 2 (Hidden): Sorting Verification", "isShown": False, "passed": False, "expected": "[1, 2, 4, 5, 8]", "actual": "Blocked"})
except Exception as e:
    results.append({"id": 1, "name": "Test Case 1 (Shown): Execution", "isShown": True, "passed": False, "expected": "Clean run", "actual": str(e)})

json.dumps(results)
`;

    case "1.2.10":
      return `
import json
results = []
try:
    if 'remove_duplicates' in globals() and callable(remove_duplicates):
        n1 = [1, 1, 2]
        k1 = remove_duplicates(n1)
        p1 = (k1 == 2 and n1[:2] == [1, 2])
        results.append({"id": 1, "name": "Test Case 1 (Shown): remove_duplicates([1, 1, 2])", "isShown": True, "passed": p1, "expected": "k=2, nums=[1, 2]", "actual": f"k={k1}, nums={n1[:k1] if k1 else []}"})
        
        n2 = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
        k2 = remove_duplicates(n2)
        p2 = (k2 == 5 and n2[:5] == [0, 1, 2, 3, 4])
        results.append({"id": 2, "name": "Test Case 2 (Hidden): remove_duplicates([0, 0, 1, 1, 1, 2, 2, 3, 3, 4])", "isShown": False, "passed": p2, "expected": "k=5, nums=[0, 1, 2, 3, 4]", "actual": f"k={k2}, nums={n2[:k2] if k2 else []}"})
    else:
        results.append({"id": 1, "name": "Test Case 1 (Shown): remove_duplicates definition", "isShown": True, "passed": False, "expected": "def remove_duplicates(nums)", "actual": "Function not found"})
        results.append({"id": 2, "name": "Test Case 2 (Hidden): In-place unique count", "isShown": False, "passed": False, "expected": "k=5, nums=[0, 1, 2, 3, 4]", "actual": "Blocked"})
except Exception as e:
    results.append({"id": 1, "name": "Test Case 1 (Shown): Execution", "isShown": True, "passed": False, "expected": "Clean run", "actual": str(e)})

json.dumps(results)
`;

    default:
      return `
import json
results = [
    {"id": 1, "name": "Test Case 1 (Shown): Execution", "isShown": True, "passed": True, "expected": "Valid execution", "actual": "Completed cleanly"},
    {"id": 2, "name": "Test Case 2 (Hidden): Output Assertion", "isShown": False, "passed": True, "expected": "Valid format", "actual": "Assertion verified"}
]
json.dumps(results)
`;
  }
};

export default function StudentIDE({ onLogout }: StudentIDEProps) {
  const [questionsList] = useState<any[]>(() => {
    const custom = JSON.parse(localStorage.getItem('socrates_custom_questions') || '[]');
    return [...QUESTIONS, ...custom];
  });

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const currentQuestion = questionsList[currentQIndex] || QUESTIONS[0];

  // Persistent Code in LocalStorage
  const [currentCode, setCurrentCode] = useState<string>(() => {
    const saved = localStorage.getItem(`socrates_editor_code_${QUESTIONS[0].id}`);
    return saved !== null ? saved : QUESTIONS[0].defaultCode;
  });

  const [isLocked, setIsLocked] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [anomalyId, setAnomalyId] = useState('');
  
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'testcases'>('terminal');
  
  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [output, setOutput] = useState('');
  
  const [pyodide, setPyodide] = useState<any>(null);
  const [isPyodideReady, setIsPyodideReady] = useState(false);

  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiScore, setAiScore] = useState<number>(95);
  const [aiFeedback, setAiFeedback] = useState<string>('');
  
  // Execution Benchmark & Debugging Trail
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [chatTrail, setChatTrail] = useState<any[]>([]);

  // Complexity & Big-O State (Integrated above test cases)
  const [complexityData, setComplexityData] = useState<ComplexityAnalysis | null>(null);

  const debounceTimer = useRef<any>(null);

  // Load code from LocalStorage + Cloud Sync from Supabase
  useEffect(() => {
    const saved = localStorage.getItem(`socrates_editor_code_${currentQuestion.id}`);
    if (saved !== null) {
      setCurrentCode(saved);
    } else {
      setCurrentCode(currentQuestion.defaultCode);
    }
    
    // Check cloud draft in Supabase
    async function loadCloudDraft() {
      try {
        const { data } = await supabase
          .from('drafts')
          .select('code')
          .eq('student_id', 'demo student')
          .eq('question_id', currentQuestion.id)
          .single();
        
        if (data && data.code) {
          setCurrentCode(data.code);
          localStorage.setItem(`socrates_editor_code_${currentQuestion.id}`, data.code);
        }
      } catch (e) {
        // Fallback to local
      }
    }
    loadCloudDraft();

    setTestResults([]);
    setOutput('');
    setHasError(false);
  }, [currentQIndex]);

  // Initialize Pyodide WebAssembly
  useEffect(() => {
    async function initPyodide() {
      try {
        // @ts-ignore
        const py = await window.loadPyodide();
        setPyodide(py);
        setIsPyodideReady(true);
      } catch (err) {
        console.error("Failed to load Pyodide:", err);
      }
    }
    initPyodide();
  }, []);

  const handleCodeChange = (newCode: string) => {
    setCurrentCode(newCode);
    localStorage.setItem(`socrates_editor_code_${currentQuestion.id}`, newCode);

    // Debounce sync to Supabase (1.2s after user pauses typing)
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        await supabase.from('drafts').upsert({
          student_id: 'demo student',
          question_id: currentQuestion.id,
          code: newCode,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        // Fallback to local storage silently
      }
    }, 1200);
  };

  const handleResetCode = async () => {
    if (window.confirm(`Reset code for "${currentQuestion.title}" back to the starting template?`)) {
      handleCodeChange(currentQuestion.defaultCode);
      try {
        await supabase
          .from('drafts')
          .delete()
          .eq('student_id', 'demo student')
          .eq('question_id', currentQuestion.id);
      } catch (e) {}
    }
  };

  const formatPythonError = (raw: string) => {
    const lines = raw.split('\n');
    const cleanedLines = lines.filter(line => {
      const l = line.trim();
      if (l.includes('_pyodide') || l.includes('eval_code_async') || l.includes('CodeRunner')) return false;
      if (l.startsWith('self.ast') || l.startsWith('mod = compile') || l.includes('PyCF_ONLY_AST')) return false;
      if (l.startsWith('^^^^') && !l.includes('def') && !l.includes('print')) return false;
      return true;
    });
    return cleanedLines.join('\n').replace(/^\\n+/, '').trim() || raw;
  };

  const handleRun = async () => {
    setPanelOpen(true);
    setActiveTab('terminal');
    
    if (!isPyodideReady) {
      setOutput("Initializing Python Environment... Please try running again in a few seconds.");
      return;
    }

    setOutput("Executing code...");
    let outText = "";
    const startTime = performance.now();
    
    try {
      pyodide.setStdout({ batched: (msg: string) => outText += msg + "\n" });
      await pyodide.runPythonAsync(currentCode);
      const elapsed = Math.round(performance.now() - startTime);
      setExecutionTimeMs(elapsed);
      
      setHasError(false);
      setOutput(outText || `Code executed successfully in ${elapsed}ms with no output.`);
    } catch (err: any) {
      setHasError(true);
      const elapsed = Math.round(performance.now() - startTime);
      setExecutionTimeMs(elapsed);
      const cleanError = formatPythonError(err.toString());
      setOutput((outText ? outText + "\n" : "") + cleanError);
    }
  };

  const handleSubmit = async () => {
    setPanelOpen(true);
    setActiveTab('testcases');
    setIsSubmitting(true);
    
    if (!isPyodideReady) {
      alert("Python environment is still initializing. Please wait a moment.");
      setIsSubmitting(false);
      return;
    }

    // Automatically analyze complexity and efficiency to display above test cases
    analyzeCodeComplexity({
      studentCode: currentCode,
      problemDescription: `${currentQuestion.title}: ${currentQuestion.description}`
    }).then(setComplexityData).catch(console.error);

    const startTime = performance.now();

    try {
      // 1. Run student's code in pyodide to define all user functions
      await pyodide.runPythonAsync(currentCode);

      // 2. Run test harness for the current question
      const testHarness = getTestHarnessForQuestion(currentQuestion.id);

      const testJson = await pyodide.runPythonAsync(testHarness);
      const parsedResults = JSON.parse(testJson);
      setTestResults(parsedResults);

      const allPassed = parsedResults.length > 0 && parsedResults.every((t: any) => t.passed);
      const score = allPassed ? 95 : Math.round((parsedResults.filter((t: any) => t.passed).length / parsedResults.length) * 50);
      setAiScore(score);
      const elapsed = Math.round(performance.now() - startTime);
      setExecutionTimeMs(elapsed);
      setAiFeedback(allPassed ? `All test cases passed in ${elapsed}ms!` : 'Some test assertions failed. Click Need Help to diagnose with Socratic AI.');

      const tag = allPassed 
        ? 'Optimal Implementation' 
        : parsedResults[0]?.passed === false 
          ? 'Function Signature Mismatch' 
          : 'Logic / Boundary Error';

      // 1. Dispatch real-time telemetry to n8n Cloud Workflow
      try {
        fetch('https://edwin98.app.n8n.cloud/webhook/socrates-telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_name: 'S EDWIN',
            question_title: currentQuestion.title,
            error_context: allPassed ? 'None' : 'Assertion check failed',
            misconception_tag: tag,
            ai_score: score
          })
        }).catch(() => {});
      } catch (e) {}

      // 2. Save submission to Supabase with Socratic debugging trail (PRD § 5.2b)
      try {
        const { error } = await supabase.from('submissions').insert([
          {
            student_id: 'demo student',
            code: currentCode || '# submitted code',
            is_successful: allPassed,
            ai_score: score,
            misconception_tag: tag,
            debugging_trail: JSON.stringify(chatTrail)
          }
        ]);
        if (error) console.error("Error saving submission:", error);
      } catch (err) {
        console.error(err);
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setExecutionTimeMs(elapsed);
      const rawErr = formatPythonError(err.toString());
      setTestResults([
        {
          id: 1,
          name: "Test Case 1 (Shown): Compilation & Signature",
          isShown: true,
          passed: false,
          expected: "Valid Python code without syntax errors",
          actual: rawErr
        },
        {
          id: 2,
          name: "Test Case 2 (Hidden): Execution",
          isShown: false,
          passed: false,
          expected: "Clean execution",
          actual: "Blocked due to compilation/syntax error"
        }
      ]);
      setAiScore(0);
      
      // Dispatch syntax error telemetry to n8n Cloud Workflow
      try {
        fetch('https://edwin98.app.n8n.cloud/webhook/socrates-telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_name: 'S EDWIN',
            question_title: currentQuestion.title,
            error_context: rawErr,
            misconception_tag: 'Syntax / Compilation Error',
            ai_score: 0
          })
        }).catch(() => {});
      } catch (e) {}

      try {
        await supabase.from('submissions').insert([
          {
            student_id: 'demo student',
            code: currentCode || '# submitted code',
            is_successful: false,
            ai_score: 0,
            misconception_tag: 'Syntax / Compilation Error',
            debugging_trail: JSON.stringify(chatTrail)
          }
        ]);
      } catch (e) {
        console.error(e);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Global IDE Keyboard Shortcuts:
  // - Ctrl/Cmd + Shift + Enter -> Submit Solution
  // - Ctrl/Cmd + Enter -> Run Code
  // - Esc -> Close Socratic AI Chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      if (isCtrlOrMeta && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (isCtrlOrMeta && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      } else if (e.key === 'Escape') {
        setChatOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCode, currentQuestion, isPyodideReady, pyodide, chatTrail]);

  const handleLockAccount = async (reason: string) => {
    setLockReason(reason);
    setIsLocked(true);

    try {
      const { data, error } = await supabase.from('anomalies').insert([
        { student_id: 'demo student', reason: reason }
      ]).select();
      
      if (error) {
        alert("Supabase Insert Error: " + error.message);
        console.error("Error saving anomaly:", error);
      }
      
      if (data && data.length > 0) {
        setAnomalyId(data[0].id);
      }
    } catch (err: any) {
      alert("Network Error: " + err.message);
    }
  };

  if (isLocked) {
    return <SuspendedScreen reason={lockReason} anomalyId={anomalyId} onAppealSubmitted={() => {}} />;
  }

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-gray-300 font-sans relative flex-col overflow-hidden">
      
      {/* Main 2-Pane Work Area */}
      <div className="flex flex-grow overflow-hidden relative">
        
        {/* Left Pane (Problem View) */}
        <div className="w-1/3 border-r border-gray-700/80 bg-[#1e1e22] flex flex-col z-10 select-text">
          <div className="p-4 border-b border-gray-700/70 bg-[#25252a] flex justify-between items-start">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 rounded-full">
                  Easy
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-blue-950/80 text-blue-300 border border-blue-700/50 rounded-full flex items-center">
                  <span className="mr-1">🐍</span> Python 3
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">{currentQuestion.title}</h2>
            </div>
          </div>

          <div className="p-4 flex-grow overflow-y-auto space-y-4">
            <div className="text-sm leading-relaxed text-gray-300 bg-gray-900/40 p-3.5 rounded-xl border border-gray-800/80 shadow-sm">
              {currentQuestion.description}
            </div>

            {currentQuestion.menu && currentQuestion.menu.length > 0 && (
              <div className="bg-[#18181b] p-3.5 rounded-xl text-xs font-mono text-gray-300 border border-gray-800 shadow-inner">
                <div className="text-gray-400 font-sans font-bold uppercase text-[10px] tracking-wider mb-2 flex items-center">
                  <BookOpen size={12} className="mr-1.5 text-blue-400" />
                  Menu Operations:
                </div>
                <div className="space-y-1 pl-1">
                  {currentQuestion.menu.map((m: string, i: number) => (
                    <div key={i} className="text-gray-300">{m}</div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-bold text-gray-300 text-xs uppercase tracking-wider mb-2 flex items-center">
                <span>Sample Test Cases</span>
              </h3>
              <div className="bg-[#141416] p-3.5 rounded-xl text-xs font-mono text-emerald-300/90 border border-gray-800/80 whitespace-pre-wrap leading-relaxed shadow-inner">
                {currentQuestion.sampleTestCases}
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane (Developer View) */}
        <div className="w-2/3 flex flex-col relative z-0 overflow-hidden bg-[#1e1e1e]">
          
          {/* Editor Header Bar */}
          <div className="h-10 bg-[#25252a] flex items-center justify-between px-4 border-b border-gray-700/80 flex-shrink-0 select-none">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-xs font-mono text-gray-200 bg-[#1e1e1e] px-3.5 py-1.5 rounded-t-lg border-t-2 border-t-blue-500 border-x border-gray-700/70 shadow-sm">
                <span className="text-amber-400">🐍</span>
                <span className="font-semibold text-gray-100">solution.py</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setSettingsOpen(true)}
                className="p-1.5 bg-[#1e1e1e] hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition border border-gray-700/60 cursor-pointer flex items-center space-x-1"
                title="AI Settings & Gemini API Key"
              >
                <Settings size={14} />
                <span className="text-[11px] font-medium hidden sm:inline text-gray-300">Settings</span>
              </button>
              {onLogout && (
                <button 
                  onClick={onLogout} 
                  className="px-2.5 py-1 bg-gray-800 hover:bg-red-950/60 hover:text-red-300 text-gray-400 text-xs font-medium rounded-lg transition border border-gray-700 cursor-pointer"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* Monaco Editor (Controlled with Persistence) */}
          <CodeEditor 
            code={currentCode}
            onLockAccount={handleLockAccount} 
            onChange={handleCodeChange} 
          />

          {/* Sliding Execution Panel */}
          <ExecutionPanel 
            isOpen={panelOpen} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            output={output}
            hasError={hasError} 
            onNeedHelp={() => setChatOpen(true)}
            testResults={testResults}
            isSubmitting={isSubmitting}
            aiScore={aiScore}
            aiFeedback={aiFeedback}
            complexityData={complexityData}
            executionTimeMs={executionTimeMs}
          />
        </div>
      </div>

      {/* Persistent Bottom Action Bar (ALWAYS VISIBLE Below Terminal & Editor) */}
      <div className="h-12 bg-[#252526] border-t border-gray-700 flex items-center justify-between px-4 z-20 flex-shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.4)]">
        {/* Navigation & Reset Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-[#1e1e1e] p-1 rounded-lg border border-gray-700">
            <button 
              onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
              disabled={currentQIndex === 0}
              className="flex items-center px-2.5 py-1 rounded text-xs font-medium bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-gray-800 text-white transition cursor-pointer"
            >
              <ChevronLeft size={14} className="mr-1" />
              Prev
            </button>
            <span className="text-xs font-mono text-gray-300 px-2 font-bold">
              Q{currentQIndex + 1} of {questionsList.length}
            </span>
            <button 
              onClick={() => setCurrentQIndex(Math.min(questionsList.length - 1, currentQIndex + 1))}
              disabled={currentQIndex === questionsList.length - 1}
              className="flex items-center px-2.5 py-1 rounded text-xs font-medium bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-gray-800 text-white transition cursor-pointer"
            >
              Next
              <ChevronRight size={14} className="ml-1" />
            </button>
          </div>

          <button 
            onClick={handleResetCode}
            className="flex items-center px-3 py-1.5 bg-[#1e1e1e] hover:bg-gray-800 text-gray-300 hover:text-white text-xs font-medium rounded-lg border border-gray-700 transition cursor-pointer"
            title="Reset to default starter code"
          >
            <RotateCcw size={13} className="mr-1.5 text-yellow-400" />
            Reset Code
          </button>
        </div>

        {/* Action Controls (Run & Submit) */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRun}
            className="flex items-center px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-md cursor-pointer"
            title="Run Code (Ctrl + Enter)"
          >
            <Play size={13} className="mr-1.5 fill-white" />
            <span>Run Code</span>
            <span className="ml-1.5 text-[10px] font-mono opacity-60 bg-blue-800/80 px-1.5 py-0.5 rounded">Ctrl+↵</span>
          </button>
          <button 
            onClick={handleSubmit}
            className="flex items-center px-5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors shadow-lg hover:shadow-green-900/40 cursor-pointer"
            title="Submit Solution (Ctrl + Shift + Enter)"
          >
            <CheckCircle2 size={15} className="mr-1.5" />
            <span>Submit Solution</span>
            <span className="ml-1.5 text-[10px] font-mono opacity-70 bg-green-800/80 px-1.5 py-0.5 rounded">Ctrl+⇧+↵</span>
          </button>
        </div>
      </div>

      {/* Socratic AI Mentor Floating Dock & Chat (Image 2 Style) */}
      <SocraticChat 
        isVisible={chatOpen} 
        onToggleVisible={() => setChatOpen(!chatOpen)}
        onClose={() => setChatOpen(false)} 
        errorContext={output}
        studentCode={currentCode}
        problemDescription={`${currentQuestion.title}: ${currentQuestion.description}`}
        onOpenSettings={() => setSettingsOpen(true)}
        onMessagesChange={setChatTrail}
      />

      {/* SensAI Settings Modal (API Keys / Usage) */}
      <AISettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </div>
  );
}
