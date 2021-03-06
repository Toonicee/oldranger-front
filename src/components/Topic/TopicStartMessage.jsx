import React from 'react';
import { parseISO, format } from 'date-fns';
import ru from 'date-fns/locale/ru';
import PropTypes from 'prop-types';
import PropTypesUser from './propTypes/userProps';
import UserAvatar from '../commons/UserAvatar';
import {
  TopicContainer,
  TopicHeaderWrapp,
  TopicHeaderTitle,
  TopicHeaderDate,
  TopicHeaderAuthorWrapp,
  TopicHeaderAuthorWrappCol,
  TopicHeaderAuthorNickName,
  TopicHeaderDefaultMessage,
} from './TopicHeaderStyled';

const TopicStartMessage = ({ topic }) => {
  return (
    <TopicContainer>
      <TopicHeaderWrapp>
        <TopicHeaderTitle>{topic.name}</TopicHeaderTitle>
        <TopicHeaderAuthorWrapp>
          <TopicHeaderAuthorWrappCol>
            <UserAvatar
              shape="square"
              size={48}
              icon="user"
              src={topic.topicStarter.avatar.small}
            />
          </TopicHeaderAuthorWrappCol>
          <TopicHeaderAuthorWrappCol>
            <TopicHeaderAuthorNickName>{topic.topicStarter.nickName}</TopicHeaderAuthorNickName>
            <TopicHeaderDate>
              {format(parseISO(topic.startTime), "dd MMMM yyyy 'в' HH:mm", {
                locale: ru,
              })}
            </TopicHeaderDate>
          </TopicHeaderAuthorWrappCol>
        </TopicHeaderAuthorWrapp>
      </TopicHeaderWrapp>
      <TopicHeaderDefaultMessage>{topic.startMessage}</TopicHeaderDefaultMessage>
    </TopicContainer>
  );
};

TopicStartMessage.propTypes = {
  topic: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    messageCount: PropTypes.number,
    startTime: PropTypes.string,
    lastMessageTime: PropTypes.string,
    startMessage: PropTypes.string,
    topicStarter: PropTypesUser.isRequired,
  }).isRequired,
};

export default TopicStartMessage;
