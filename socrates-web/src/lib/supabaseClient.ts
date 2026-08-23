import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Determine if we have real configured Supabase credentials
const isRealSupabaseConfigured = 
  Boolean(supabaseUrl) && 
  Boolean(supabaseKey) && 
  !supabaseUrl.includes('placeholder') && 
  !supabaseKey.includes('placeholder');

// Real Supabase Client (if configured)
const realSupabase = isRealSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// ============================================================================
// IN-MEMORY / LOCALSTORAGE MOCK DATABASE ENGINE
// (Guarantees 100% full offline & zero-backend functionality for judging & demos)
// ============================================================================

const SEED_SUBMISSIONS = [
  {
    id: 'sub_001',
    student_id: 'S EDWIN',
    code: 'def reverse_array(arr):\n    left = 0\n    right = len(arr) - 1\n    while left < right:\n        arr[left], arr[right] = arr[right], arr[left]\n        left += 1\n        right -= 1\n    return arr',
    is_successful: true,
    ai_score: 95,
    misconception_tag: 'Optimal Implementation',
    debugging_trail: JSON.stringify([
      { role: 'student', text: 'How do I reverse an array in-place without creating a copy?' },
      { role: 'ai', text: 'Think about using two pointers starting from both ends. What happens when you swap them and move inward?', tag: 'Two-Pointer Technique', confidence: 'yes' },
      { role: 'student', text: 'Got it! I swap arr[left] and arr[right] while left < right.' }
    ]),
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: 'sub_002',
    student_id: 'Aarav Sharma',
    code: 'def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []',
    is_successful: true,
    ai_score: 98,
    misconception_tag: 'Optimal Hash Table Pass',
    debugging_trail: '[]',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'sub_003',
    student_id: 'Priya Patel',
    code: 'def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: low = mid + 1\n        else: high = mid - 1\n    return -1',
    is_successful: true,
    ai_score: 92,
    misconception_tag: 'Optimal Implementation',
    debugging_trail: '[]',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  },
  {
    id: 'sub_004',
    student_id: 'Rahul Verma',
    code: 'def find_max(arr):\n    # student had loop boundary error\n    m = arr[0]\n    for i in range(len(arr)):\n        if arr[i] > m: m = arr[i]\n    return m',
    is_successful: false,
    ai_score: 65,
    misconception_tag: 'Loop Boundary Error',
    debugging_trail: JSON.stringify([
      { role: 'student', text: 'Why is my loop failing on empty array?' },
      { role: 'ai', text: 'What happens if arr has 0 elements when you access arr[0] on the first line?', tag: 'Empty Edge Case' }
    ]),
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  }
];

const SEED_ANOMALIES = [
  {
    id: 'anom_001',
    student_id: 'Rahul Verma',
    reason: 'Suspicious anti-paste clipboard velocity detected (180 chars/sec)',
    is_resolved: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  }
];

// Helper to get collection from localStorage
function getMockCollection(table: string): any[] {
  try {
    const key = `socrates_mock_db_${table}`;
    const data = localStorage.getItem(key);
    if (!data) {
      if (table === 'submissions') {
        localStorage.setItem(key, JSON.stringify(SEED_SUBMISSIONS));
        return [...SEED_SUBMISSIONS];
      }
      if (table === 'anomalies') {
        localStorage.setItem(key, JSON.stringify(SEED_ANOMALIES));
        return [...SEED_ANOMALIES];
      }
      return [];
    }
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

// Helper to save collection to localStorage
function saveMockCollection(table: string, items: any[]) {
  try {
    localStorage.setItem(`socrates_mock_db_${table}`, JSON.stringify(items));
  } catch (e) {}
}

// Chainable Mock Query Builder mirroring Supabase PostgREST API
class MockQueryBuilder {
  private table: string;
  private filters: Array<(item: any) => boolean> = [];
  private sortField: string | null = null;
  private sortAscending: boolean = true;
  private limitCount: number | null = null;
  private isMutation: boolean = false;
  private mutationResult: any = null;

  constructor(table: string) {
    this.table = table;
  }

  select(_columns: string = '*') {
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push(item => item[field] === value);
    return this;
  }

  order(field: string, options: { ascending?: boolean } = {}) {
    this.sortField = field;
    this.sortAscending = options.ascending !== false;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async insert(rows: any | any[]) {
    this.isMutation = true;
    const items = getMockCollection(this.table);
    const toInsert = Array.isArray(rows) ? rows : [rows];
    
    const newRecords = toInsert.map(row => ({
      id: row.id || `mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      created_at: row.created_at || new Date().toISOString(),
      ...row
    }));

    items.unshift(...newRecords);
    saveMockCollection(this.table, items);
    this.mutationResult = { data: newRecords, error: null };
    return this.mutationResult;
  }

  async upsert(row: any) {
    this.isMutation = true;
    const items = getMockCollection(this.table);
    const index = items.findIndex(item => 
      (row.id && item.id === row.id) || 
      (row.student_id && row.question_id && item.student_id === row.student_id && item.question_id === row.question_id)
    );

    const record = {
      id: row.id || (index >= 0 ? items[index].id : `mock_${Date.now()}`),
      created_at: index >= 0 ? items[index].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...row
    };

    if (index >= 0) {
      items[index] = record;
    } else {
      items.unshift(record);
    }

    saveMockCollection(this.table, items);
    this.mutationResult = { data: [record], error: null };
    return this.mutationResult;
  }

  async update(values: any) {
    this.isMutation = true;
    const items = getMockCollection(this.table);
    let updatedCount = 0;

    const updated = items.map(item => {
      const matches = this.filters.length === 0 || this.filters.every(f => f(item));
      if (matches) {
        updatedCount++;
        return { ...item, ...values, updated_at: new Date().toISOString() };
      }
      return item;
    });

    saveMockCollection(this.table, updated);
    this.mutationResult = { data: updated, error: null };
    return this.mutationResult;
  }

  async delete() {
    this.isMutation = true;
    const items = getMockCollection(this.table);
    const remaining = items.filter(item => {
      return !this.filters.every(f => f(item));
    });

    saveMockCollection(this.table, remaining);
    this.mutationResult = { data: remaining, error: null };
    return this.mutationResult;
  }

  // Promise-like resolution allowing `const { data, error } = await supabase.from(...)`
  then(resolve: (result: { data: any[] | null; error: any | null }) => void) {
    if (this.isMutation) {
      resolve(this.mutationResult || { data: [], error: null });
      return;
    }

    try {
      let items = getMockCollection(this.table);

      // Apply filters
      if (this.filters.length > 0) {
        items = items.filter(item => this.filters.every(f => f(item)));
      }

      // Apply sorting
      if (this.sortField) {
        const field = this.sortField;
        const asc = this.sortAscending;
        items.sort((a, b) => {
          const valA = a[field] || '';
          const valB = b[field] || '';
          if (valA < valB) return asc ? -1 : 1;
          if (valA > valB) return asc ? 1 : -1;
          return 0;
        });
      }

      // Apply limit
      if (this.limitCount !== null) {
        items = items.slice(0, this.limitCount);
      }

      resolve({ data: items, error: null });
    } catch (err) {
      resolve({ data: [], error: null });
    }
  }
}

// Unified Transparent Supabase Client
export const supabase = {
  from(table: string) {
    if (realSupabase) {
      try {
        return realSupabase.from(table);
      } catch (e) {
        return new MockQueryBuilder(table) as any;
      }
    }
    return new MockQueryBuilder(table) as any;
  }
};
