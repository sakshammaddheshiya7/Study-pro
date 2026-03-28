import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  db, collection, addDoc, getDocs, deleteDoc, doc,
  query, orderBy, limit, onSnapshot, serverTimestamp, updateDoc, arrayUnion, arrayRemove
} from '../../config/firebase';
import {
  FiArrowLeft, FiSend, FiHeart, FiMessageCircle, FiTrash2,
  FiMoreVertical, FiImage, FiSmile, FiRefreshCw, FiBookmark
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Community() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [postTag, setPostTag] = useState('general');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [filterTag, setFilterTag] = useState('all');
  const [commentingOn, setCommentingOn] = useState(null);
  const [commentText, setCommentText] = useState('');

  const TAGS = [
    { id: 'general', label: '💬 General', color: 'bg-gray-100 text-gray-700' },
    { id: 'doubt', label: '❓ Doubt', color: 'bg-blue-100 text-blue-700' },
    { id: 'motivation', label: '🔥 Motivation', color: 'bg-amber-100 text-amber-700' },
    { id: 'tips', label: '💡 Tips', color: 'bg-green-100 text-green-700' },
    { id: 'achievement', label: '🏆 Achievement', color: 'bg-purple-100 text-purple-700' },
    { id: 'resource', label: '📚 Resource', color: 'bg-pink-100 text-pink-700' }
  ];

  useEffect(() => {
    const q = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) { toast.error('Write something'); return; }
    if (newPost.trim().length < 3) { toast.error('Too short'); return; }
    try {
      setPosting(true);
      await addDoc(collection(db, 'communityPosts'), {
        content: newPost.trim(),
        tag: postTag,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        likes: [],
        comments: [],
        createdAt: serverTimestamp()
      });
      setNewPost('');
      toast.success('Posted! 🎉');
    } catch (error) { toast.error('Failed to post'); }
    finally { setPosting(false); }
  };

  const handleLike = async (postId, currentLikes) => {
    try {
      const postRef = doc(db, 'communityPosts', postId);
      const isLiked = (currentLikes || []).includes(user.uid);
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) { console.error(error); }
  };

  const handleComment = async (postId) => {
    if (!commentText.trim()) return;
    try {
      const postRef = doc(db, 'communityPosts', postId);
      await updateDoc(postRef, {
        comments: arrayUnion({
          userId: user.uid,
          userName: user.displayName || 'Anonymous',
          userPhoto: user.photoURL || '',
          content: commentText.trim(),
          createdAt: new Date().toISOString()
        })
      });
      setCommentText('');
      setCommentingOn(null);
      toast.success('Comment added');
    } catch (error) { toast.error('Failed'); }
  };

  const handleDeletePost = async (postId, postUserId) => {
    if (postUserId !== user.uid) { toast.error('You can only delete your own posts'); return; }
    try {
      await deleteDoc(doc(db, 'communityPosts', postId));
      toast.success('Post deleted');
    } catch (error) { toast.error('Delete failed'); }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const filteredPosts = filterTag === 'all' ? posts : posts.filter(p => p.tag === filterTag);

  return (
    <div className="page-container pt-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-5">
        <button onClick={() => navigate('/student')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-dark-800">Community 🌐</h1>
          <p className="text-xs text-dark-400">{posts.length} posts • Real-time</p>
        </div>
      </div>

      {/* Compose */}
      <div className="card mb-5">
        <div className="flex items-start space-x-3 mb-3">
          <img
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'U'}&background=F97316&color=fff`}
            alt="" className="w-9 h-9 rounded-full flex-shrink-0"
          />
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind? Share doubts, tips, achievements..."
            rows={2}
            className="input-field text-sm resize-none flex-1"
            maxLength={500}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex space-x-1.5 overflow-x-auto no-scrollbar">
            {TAGS.map(tag => (
              <button
                key={tag.id}
                onClick={() => setPostTag(tag.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all ${
                  postTag === tag.id ? tag.color + ' ring-2 ring-offset-1 ring-primary-300' : 'bg-gray-50 text-dark-400'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
          <button
            onClick={handlePost}
            disabled={posting || !newPost.trim()}
            className="ml-3 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold flex items-center space-x-1 disabled:opacity-40 hover:bg-primary-600 active:scale-95 transition-all flex-shrink-0"
          >
            {posting ? <FiRefreshCw className="animate-spin" size={14} /> : <FiSend size={14} />}
            <span>Post</span>
          </button>
        </div>
        {newPost.length > 0 && (
          <p className="text-[10px] text-dark-400 text-right mt-1">{newPost.length}/500</p>
        )}
      </div>

      {/* Filter Tags */}
      <div className="flex space-x-2 mb-4 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setFilterTag('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            filterTag === 'all' ? 'bg-dark-800 text-white' : 'bg-gray-100 text-dark-500'
          }`}
        >All</button>
        {TAGS.map(tag => (
          <button
            key={tag.id}
            onClick={() => setFilterTag(tag.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterTag === tag.id ? tag.color + ' shadow-sm' : 'bg-gray-50 text-dark-400'
            }`}
          >{tag.label}</button>
        ))}
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 bg-gray-100 rounded-full skeleton" />
                <div className="flex-1"><div className="w-1/3 h-3 bg-gray-100 rounded skeleton" /></div>
              </div>
              <div className="w-full h-12 bg-gray-100 rounded skeleton" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-3">🌐</p>
          <p className="text-dark-500 font-medium">No posts yet</p>
          <p className="text-dark-400 text-sm mt-1">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map(post => {
            const isLiked = (post.likes || []).includes(user?.uid);
            const likeCount = (post.likes || []).length;
            const commentCount = (post.comments || []).length;
            const tagConfig = TAGS.find(t => t.id === post.tag) || TAGS[0];
            const isOwn = post.userId === user?.uid;

            return (
              <div key={post.id} className="card p-4 animate-fade-in">
                {/* Post Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={post.userPhoto || `https://ui-avatars.com/api/?name=${post.userName || 'U'}&background=ccc&color=555&size=40`}
                      alt="" className="w-9 h-9 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-semibold text-dark-800">{post.userName}</p>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] text-dark-400">{formatTime(post.createdAt)}</span>
                        <span className={`badge text-[8px] ${tagConfig.color}`}>{tagConfig.label}</span>
                      </div>
                    </div>
                  </div>
                  {isOwn && (
                    <button
                      onClick={() => handleDeletePost(post.id, post.userId)}
                      className="p-1.5 text-dark-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Post Content */}
                <p className="text-sm text-dark-700 leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>

                {/* Actions */}
                <div className="flex items-center space-x-4 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleLike(post.id, post.likes)}
                    className={`flex items-center space-x-1.5 text-sm transition-all active:scale-90 ${
                      isLiked ? 'text-red-500' : 'text-dark-400 hover:text-red-500'
                    }`}
                  >
                    <FiHeart size={16} className={isLiked ? 'fill-current' : ''} />
                    <span className="font-medium">{likeCount || ''}</span>
                  </button>
                  <button
                    onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
                    className="flex items-center space-x-1.5 text-sm text-dark-400 hover:text-blue-500 transition-all"
                  >
                    <FiMessageCircle size={16} />
                    <span className="font-medium">{commentCount || ''}</span>
                  </button>
                </div>

                {/* Comments */}
                {(commentCount > 0 || commentingOn === post.id) && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    {(post.comments || []).slice(-3).map((comment, ci) => (
                      <div key={ci} className="flex items-start space-x-2">
                        <img
                          src={comment.userPhoto || `https://ui-avatars.com/api/?name=${comment.userName || 'U'}&size=28&background=eee&color=555`}
                          alt="" className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5"
                        />
                        <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                          <p className="text-[11px] font-semibold text-dark-700">{comment.userName}</p>
                          <p className="text-xs text-dark-600">{comment.content}</p>
                        </div>
                      </div>
                    ))}

                    {commentingOn === post.id && (
                      <div className="flex items-center space-x-2 mt-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                          placeholder="Write a comment..."
                          className="input-field text-xs py-2 flex-1"
                          maxLength={200}
                        />
                        <button
                          onClick={() => handleComment(post.id)}
                          disabled={!commentText.trim()}
                          className="w-9 h-9 bg-primary-500 text-white rounded-xl flex items-center justify-center disabled:opacity-40 active:scale-90 transition-all"
                        >
                          <FiSend size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}