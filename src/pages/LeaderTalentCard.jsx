import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getCandidateByIdLeader } from '../store/slices/leaderSlice';
import TalentCard from '../components/talent-card/TalentCard';

const LeaderTalentCard = () => {
  const { candidateId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentCandidate, loading, error } = useSelector((state) => state.leader);

  useEffect(() => {
    if (candidateId) {
      dispatch(getCandidateByIdLeader(parseInt(candidateId)));
    }
  }, [candidateId, dispatch]);

  return (
    <TalentCard
      role="leader"
      candidateId={candidateId}
      candidate={currentCandidate}
      loading={loading}
      error={error}
      onBack={() => navigate('/leader/dashboard')}
    />
  );
};

export default LeaderTalentCard;
