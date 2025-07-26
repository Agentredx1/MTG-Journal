import { useState } from 'react';

export interface UseCommanderModalReturn {
  selectedCommander: string | null;
  isModalOpen: boolean;
  handleCommanderClick: (commanderName: string) => void;
  handleModalClose: () => void;
  openModal: (commanderName: string) => void;
  closeModal: () => void;
}

export const useCommanderModal = (): UseCommanderModalReturn => {
  const [selectedCommander, setSelectedCommander] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCommanderClick = (commanderName: string) => {
    setSelectedCommander(commanderName);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCommander(null);
  };

  const openModal = (commanderName: string) => {
    setSelectedCommander(commanderName);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCommander(null);
  };

  return {
    selectedCommander,
    isModalOpen,
    handleCommanderClick,
    handleModalClose,
    openModal,
    closeModal
  };
};