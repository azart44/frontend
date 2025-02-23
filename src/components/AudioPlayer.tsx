import React from 'react';
import { Text, Flex } from '@aws-amplify/ui-react';

interface AudioPlayerProps {
  src: string;
  name: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, name }) => {
  return (
    <Flex direction="column" margin="1rem 0">
      <Text>{name}</Text>
      <audio controls src={src}>
        Your browser does not support the audio element.
      </audio>
    </Flex>
  );
};

export default AudioPlayer;