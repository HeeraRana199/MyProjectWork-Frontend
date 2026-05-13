import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getCandidateById } from '../store/slices/candidateSlice';
import TalentCard from '../components/talent-card/TalentCard';

// When candidateIdOverride is provided the component is embedded in the Trainee Dashboard.
// When used standalone via route, it falls back to useParams.
const TraineeTalentCard = ({ candidateIdOverride }) => {
  const { candidateId: paramCandidateId } = useParams();
  const candidateId = candidateIdOverride || paramCandidateId;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentCandidate, loading, error } = useSelector((state) => state.candidate);

  useEffect(() => {
    if (candidateId) {
      dispatch(getCandidateById(parseInt(candidateId)));
    }
  }, [candidateId, dispatch]);

  return (
    <TalentCard
      role="trainee"
      candidateId={candidateId}
      candidate={currentCandidate}
      loading={loading}
      error={error}
      onBack={candidateIdOverride ? undefined : () => navigate('/trainee/dashboard')}
    />
  );
};

export default TraineeTalentCard;
