import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from './AuthContext';

export const FeatureRequestContext = createContext();

const RE_STORAGE_KEY = 'feature_requests';
const UPVOTE_STORAGE_KEY_PREFIX = 'user_upvotes_history';
const CONFIRM_STORAGE_KEY_PREFIX = 'user_has_seen_confirm';
const MAX_UPVOTES_PER_MONTH = 5;

export const FeatureRequestProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const userEmail = user?.email;
  const userKey = userEmail ? userEmail.replace(/[.@]/g, '_') : 'guest';
  const UPVOTE_KEY = `${UPVOTE_STORAGE_KEY_PREFIX}_${userKey}`;
  const CONFIRM_KEY = `${CONFIRM_STORAGE_KEY_PREFIX}_${userKey}`;

  // 1. Global Requests State
  const [requests, setRequests] = useState(() => {
    const storedData = localStorage.getItem(RE_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : [
      { id: '1', title: 'Dark Mode', description: 'Add dark mode to the application.', status: 'Delivered', upvotes: 120, upvotedBy: [], createdAt: new Date().toISOString(), comments: [] },
      { id: '2', title: 'Export to CSV', description: 'Allow users to export feature requests to CSV.', status: 'In progress', upvotes: 45, upvotedBy: [], createdAt: new Date().toISOString(), comments: [] },
      { id: '3', title: 'Notification System', description: 'Real-time notifications for status updates.', status: 'New', upvotes: 12, upvotedBy: [], createdAt: new Date().toISOString(), comments: [] },
    ];
  });

  // 2. Per-User Voting State
  const [upvoteHistory, setUpvoteHistory] = useState([]);
  const [hasSeenConfirm, setHasSeenConfirm] = useState(false);

  // Load user data on user change
  useEffect(() => {
    if (!userEmail) {
      setUpvoteHistory([]);
      setHasSeenConfirm(false);
      return;
    }
    const storedHistory = localStorage.getItem(UPVOTE_KEY);
    setUpvoteHistory(storedHistory ? JSON.parse(storedHistory) : []);
    setHasSeenConfirm(localStorage.getItem(CONFIRM_KEY) === 'true');
  }, [userEmail, UPVOTE_KEY, CONFIRM_KEY]);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(RE_STORAGE_KEY, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem(UPVOTE_KEY, JSON.stringify(upvoteHistory));
    }
  }, [upvoteHistory, UPVOTE_KEY, userEmail]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem(CONFIRM_KEY, hasSeenConfirm.toString());
    }
  }, [hasSeenConfirm, CONFIRM_KEY, userEmail]);

  const getInMonthHistory = useCallback((history) => {
    return history.filter(timestamp => {
      const date = new Date(timestamp);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
  }, []);

  const upvotesThisMonth = getInMonthHistory(upvoteHistory);
  const upvotesRemaining = Math.max(0, MAX_UPVOTES_PER_MONTH - upvotesThisMonth.length);
  const canUpvote = upvotesRemaining > 0;

  const addRequest = useCallback((title, description) => {
    const newRequest = {
      id: uuidv4(),
      title,
      description,
      status: 'New',
      upvotes: 0,
      upvotedBy: [],
      createdAt: new Date().toISOString(),
      comments: [],
    };
    setRequests(prev => [newRequest, ...prev]);
  }, []);

  const upvoteRequest = useCallback((id) => {
    if (!canUpvote || !userEmail) return false;

    setRequests(prev => prev.map(req => 
      req.id === id ? { 
        ...req, 
        upvotes: req.upvotes + 1,
        upvotedBy: [...(req.upvotedBy || []), userEmail]
      } : req
    ));

    setUpvoteHistory(prev => [...prev, new Date().toISOString()]);
    return true;
  }, [canUpvote, userEmail]);

  const revokeUpvote = useCallback((id) => {
    if (!userEmail) return false;

    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        const index = req.upvotedBy.lastIndexOf(userEmail);
        if (index === -1) return req; // Not upvoted by this user
        
        const newUpvotedBy = [...req.upvotedBy];
        newUpvotedBy.splice(index, 1);
        return { 
          ...req, 
          upvotes: Math.max(0, req.upvotes - 1),
          upvotedBy: newUpvotedBy
        };
      }
      return req;
    }));

    setUpvoteHistory(prev => {
      const newHistory = [...prev];
      const index = newHistory.findLastIndex(timestamp => {
        const date = new Date(timestamp);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });
      if (index !== -1) newHistory.splice(index, 1);
      return newHistory;
    });

    return true;
  }, [userEmail]);

  const deleteRequest = useCallback((id) => {
    setRequests(prev => prev.filter(req => req.id !== id));
  }, []);

  const deleteComment = useCallback((requestId, commentId) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          comments: (req.comments || []).filter(c => c.id !== commentId)
        };
      }
      return req;
    }));
  }, []);

  const addComment = useCallback((requestId, text, author, isAdmin = false) => {
    const newComment = {
      id: uuidv4(),
      text,
      author,
      isAdmin,
      createdAt: new Date().toISOString()
    };
    
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, comments: [...(req.comments || []), newComment] } : req
    ));
  }, []);

  const updateStatus = useCallback((id, status) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status } : req
    ));
  }, []);

  const mergeRequests = useCallback((primaryId, sourceIds) => {
    setRequests(prev => {
      const primaryIndex = prev.findIndex(r => String(r.id) === String(primaryId));
      if (primaryIndex === -1) return prev;
      
      const sources = prev.filter(r => 
        sourceIds.map(String).includes(String(r.id)) && 
        String(r.id) !== String(primaryId)
      );
      const primary = prev[primaryIndex];
      
      // 1. Consolidate Upvotes
      const totalSourceVotes = sources.reduce((sum, s) => sum + (s.upvotes || 0), 0);
      const newUpvotes = primary.upvotes + totalSourceVotes;
      
      // 2. Clear Duplicates in upvotedBy
      const allUpvoters = [
        ...(primary.upvotedBy || []),
        ...sources.flatMap(s => s.upvotedBy || [])
      ];
      const uniqueUpvoters = Array.from(new Set(allUpvoters));
      
      // 3. Migrate Comments
      const allComments = [
        ...(primary.comments || []),
        ...sources.flatMap(s => s.comments || [])
      ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      // 4. Create updated primary
      const updatedPrimary = {
        ...primary,
        upvotes: newUpvotes,
        upvotedBy: uniqueUpvoters,
        comments: allComments
      };
      
      // 5. Remove sources and update primary
      return prev
        .filter(r => !sourceIds.includes(r.id) || r.id === primaryId)
        .map(r => r.id === primaryId ? updatedPrimary : r);
    });
  }, []);

  const hasUpvoted = useCallback((requestId) => {
    const request = requests.find(r => r.id === requestId);
    return request?.upvotedBy?.includes(userEmail);
  }, [requests, userEmail]);

  const value = {
    requests,
    addRequest,
    upvoteRequest,
    revokeUpvote,
    deleteRequest,
    deleteComment,
    addComment,
    updateStatus,
    mergeRequests,
    canUpvote,
    upvotesRemaining,
    upvotesThisMonth,
    hasUpvoted,
    hasSeenConfirm,
    setHasSeenConfirm
  };

  return (
    <FeatureRequestContext.Provider value={value}>
      {children}
    </FeatureRequestContext.Provider>
  );
};
