import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssociateById } from '../store/slices/candidateSlice';
import TalentCard from '../components/talent-card/TalentCard';

// When candidateIdOverride is provided the component is embedded in the Trainee Dashboard.
// When used standalone via route, it falls back to useParams.
const TraineeTalentCard = ({ candidateIdOverride }) => {
  const { associateId: paramCandidateId } = useParams();
  const associateId = candidateIdOverride || paramCandidateId;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentCandidate, loading, error } = useSelector((state) => state.candidate);

  useEffect(() => {
    if (associateId) {
      dispatch(getAssociateById(parseInt(associateId)));
    }
  }, [associateId, dispatch]);

  return (
    <TalentCard
      role="trainee"
      associateId={associateId}
      candidate={currentCandidate}
      loading={loading}
      error={error}
      onBack={candidateIdOverride ? undefined : () => navigate('/trainee/dashboard')}
    />
  );
};

export default TraineeTalentCard;
