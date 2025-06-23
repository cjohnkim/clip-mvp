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
      {/* Daily Recommendations */}
      {dailyRecs && (
        <AICard sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
              <Speed sx={{ color: '#00d4aa' }} />
              Instant Insights
            </Typography>
            
            <Stack spacing={2}>
              <Alert severity="info" icon={<TrendingUp />}>
                <Typography variant="body2" fontWeight={500}>
                  Smart Limit: ${dailyRecs.suggested_daily_limit.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {dailyRecs.focus_category} is your focus today
                </Typography>
              </Alert>
              
              <Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  💡 {dailyRecs.daily_tip}
                </Typography>
                <Typography variant="caption" color="primary" fontStyle="italic">
                  {dailyRecs.motivation}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </AICard>
      )}

      {/* AI Suggestions */}
      <AICard>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600} display="flex" alignItems="center" gap={1}>
              <SmartToy sx={{ color: '#00d4aa' }} />
              Quick Actions
              {pendingSuggestions.length > 0 && (
                <Chip 
                  label={pendingSuggestions.length} 
                  size="small" 
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <IconButton onClick={() => setExpanded(!expanded)} size="small">
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Collapse in={expanded}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {pendingSuggestions.length === 0 ? (
              <Box textAlign="center" py={3}>
                <CheckCircle sx={{ fontSize: 48, color: '#10b981', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  All set! You're on track.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {pendingSuggestions.map((suggestion) => (
                  <SuggestionCard key={suggestion.id}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        {suggestion.transaction && (
                          <Box mb={1}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {suggestion.transaction.description}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ${Math.abs(suggestion.transaction.amount).toFixed(2)} • {suggestion.transaction.date}
                            </Typography>
                          </Box>
                        )}
                        
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          {suggestion.suggestion.message}
                        </Typography>
                        
                        <Stack direction="row" spacing={1} alignItems="center">
                          {suggestion.suggestion.category && (
                            <Chip 
                              label={suggestion.suggestion.category} 
                              size="small"
                              sx={{ backgroundColor: '#e5e7eb' }}
                            />
                          )}
                          {suggestion.suggestion.confidence && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <LinearProgress 
                                variant="determinate" 
                                value={suggestion.suggestion.confidence * 100}
                                sx={{ 
                                  width: 60, 
                                  height: 6, 
                                  borderRadius: 3,
                                  backgroundColor: '#e5e7eb',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: getConfidenceColor(suggestion.suggestion.confidence),
                                  }
                                }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {Math.round(suggestion.suggestion.confidence * 100)}%
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                      
                      <Stack direction="row" spacing={1} ml={2}>
                        <Tooltip title="Edit & Approve">
                          <IconButton
                            size="small"
                            onClick={() => handleEditSuggestion(suggestion)}
                            disabled={processingId === suggestion.id}
                          >
                            <SmartToy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApproveSuggestion(suggestion)}
                            disabled={processingId === suggestion.id}
                          >
                            {processingId === suggestion.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <CheckCircle />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRejectSuggestion(suggestion.id)}
                            disabled={processingId === suggestion.id}
                          >
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </SuggestionCard>
                ))}
              </Stack>
            )}
          </Collapse>
        </CardContent>
      </AICard>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, suggestion: null, editedCategory: '', editedFrequency: '' })}>
        <DialogTitle>Edit AI Suggestion</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2, minWidth: 400 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={editDialog.editedCategory}
                onChange={(e) => setEditDialog({ ...editDialog, editedCategory: e.target.value })}
                label="Category"
              >
                {['Housing', 'Transportation', 'Food', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Other'].map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {editDialog.suggestion?.suggestion.isRecurring && (
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={editDialog.editedFrequency}
                  onChange={(e) => setEditDialog({ ...editDialog, editedFrequency: e.target.value })}
                  label="Frequency"
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, suggestion: null, editedCategory: '', editedFrequency: '' })}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" sx={{ backgroundColor: '#00d4aa' }}>
            Save & Approve
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AISuggestionsPanel;