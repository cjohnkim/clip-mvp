import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Collapse,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  SmartToy,
  CheckCircle,
  Cancel,
  ExpandMore,
  ExpandLess,
  TrendingUp,
  Warning,
  Lightbulb,
  Speed,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const AICard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
  borderRadius: 16,
  marginBottom: theme.spacing(2),
  border: '1px solid #e5e7eb',
}));

const SuggestionCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: 12,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  border: '1px solid #e5e7eb',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
}));

interface AISuggestion {
  id: string;
  type: 'categorization' | 'recurring' | 'budget' | 'saving';
  transaction?: {
    id: string;
    description: string;
    amount: number;
    date: string;
  };
  suggestion: {
    category?: string;
    confidence?: number;
    isRecurring?: boolean;
    recurringFrequency?: string;
    savingOpportunity?: string;
    message: string;
  };
  status: 'pending' | 'approved' | 'rejected';
}

interface DailyRecommendation {
  recommendations: string[];
  daily_tip: string;
  suggested_daily_limit: number;
  focus_category: string;
  motivation: string;
}

interface AISuggestionsPanelProps {
  onSuggestionApproved?: () => void;
}

const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({ onSuggestionApproved }) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [dailyRecs, setDailyRecs] = useState<DailyRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    suggestion: AISuggestion | null;
    editedCategory: string;
    editedFrequency: string;
  }>({
    open: false,
    suggestion: null,
    editedCategory: '',
    editedFrequency: '',
  });

  useEffect(() => {
    loadAISuggestions();
    loadDailyRecommendations();
  }, []);

  const loadAISuggestions = async () => {
    try {
      // For now, we'll use mock data
      const mockSuggestions: AISuggestion[] = [
        {
          id: '1',
          type: 'categorization',
          transaction: {
            id: 'txn_1',
            description: 'Whole Foods Market',
            amount: -87.43,
            date: '2025-06-22',
          },
          suggestion: {
            category: 'Food',
            confidence: 0.95,
            message: 'Categorized as Food (Groceries) with 95% confidence',
          },
          status: 'pending',
        },
        {
          id: '2',
          type: 'recurring',
          transaction: {
            id: 'txn_2',
            description: 'Netflix Monthly',
            amount: -15.99,
            date: '2025-06-20',
          },
          suggestion: {
            isRecurring: true,
            recurringFrequency: 'monthly',
            category: 'Entertainment',
            message: 'This appears to be a monthly subscription',
          },
          status: 'pending',
        },
      ];
      
      setSuggestions(mockSuggestions);
      setLoading(false);
    } catch (err) {
      console.error('Error loading AI suggestions:', err);
      setError('Failed to load AI suggestions');
      setLoading(false);
    }
  };

  const loadDailyRecommendations = async () => {
    try {
      const token = localStorage.getItem('money_clip_token');
      const apiBaseUrl = window.location.hostname === 'app.moneyclip.money' 
        ? 'https://clip-mvp-production.up.railway.app'
        : process.env.REACT_APP_API_URL || 'http://localhost:5001';

      const response = await fetch(`${apiBaseUrl}/api/ai/daily-recommendations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDailyRecs(data);
      }
    } catch (err) {
      console.error('Error loading daily recommendations:', err);
    }
  };

  const handleApproveSuggestion = async (suggestion: AISuggestion) => {
    setProcessingId(suggestion.id);
    
    try {
      const token = localStorage.getItem('money_clip_token');
      const apiBaseUrl = window.location.hostname === 'app.moneyclip.money' 
        ? 'https://clip-mvp-production.up.railway.app'
        : process.env.REACT_APP_API_URL || 'http://localhost:5001';

      const response = await fetch(`${apiBaseUrl}/api/ai/approve-suggestions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: suggestion.transaction?.id,
          category: suggestion.suggestion.category,
          is_recurring: suggestion.suggestion.isRecurring,
          recurring_frequency: suggestion.suggestion.recurringFrequency,
        }),
      });

      if (response.ok) {
        // Update local state
        setSuggestions(prev => 
          prev.map(s => s.id === suggestion.id ? { ...s, status: 'approved' } : s)
        );
        
        if (onSuggestionApproved) {
          onSuggestionApproved();
        }
      }
    } catch (err) {
      console.error('Error approving suggestion:', err);
      setError('Failed to approve suggestion');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === suggestionId ? { ...s, status: 'rejected' } : s)
    );
  };

  const handleEditSuggestion = (suggestion: AISuggestion) => {
    setEditDialog({
      open: true,
      suggestion,
      editedCategory: suggestion.suggestion.category || '',
      editedFrequency: suggestion.suggestion.recurringFrequency || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editDialog.suggestion) return;

    const updatedSuggestion = {
      ...editDialog.suggestion,
      suggestion: {
        ...editDialog.suggestion.suggestion,
        category: editDialog.editedCategory,
        recurringFrequency: editDialog.editedFrequency,
      },
    };

    await handleApproveSuggestion(updatedSuggestion);
    setEditDialog({ open: false, suggestion: null, editedCategory: '', editedFrequency: '' });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return '#10b981';
    if (confidence >= 0.7) return '#f59e0b';
    return '#ef4444';
  };

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  if (loading) {
    return (
      <AICard>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" py={3}>
            <CircularProgress size={32} />
          </Box>
        </CardContent>
      </AICard>
    );
  }

  return (
    <>
      {/* Only show if there's actionable insight */}
      {false && dailyRecs && (
        <AICard sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="body1" fontWeight={500} color="text.secondary" textAlign="center">
              {/* Will show actual actionable insights when we have them */}
            </Typography>
          </CardContent>
        </AICard>
      )}

    </>
  );
};

export default AISuggestionsPanel;