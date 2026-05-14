import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssociateByIdLeader } from '../store/slices/leaderSlice';
import TalentCard from '../components/talent-card/TalentCard';

const LeaderTalentCard = () => {
  const { associateId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentCandidate, loading, error } = useSelector((state) => state.leader);

  useEffect(() => {
    if (associateId) {
      dispatch(getAssociateByIdLeader(parseInt(associateId)));
    }
  }, [associateId, dispatch]);

  return (
    <TalentCard
      role="leader"
      associateId={associateId}
      candidate={currentCandidate}
      loading={loading}
      error={error}
      onBack={() => navigate('/leader/dashboard')}
    />
  );
};

export default LeaderTalentCard;
