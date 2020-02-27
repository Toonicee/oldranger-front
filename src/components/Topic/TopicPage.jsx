import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { Avatar, Breadcrumb, message, notification, Spin, Typography, Button, Result } from 'antd';
// import styled from 'styled-components';
import Comment from 'antd/es/comment';
import { Markup } from 'interweave';
import TopicCommentsList from './TopicCommentsList';
import queries from '../../serverQueries';
import { GoldIcon, ReplyFloatButton, TopicCommentReplyAlert } from './styled';
import TopicReplyForm from './TopicReplyForm';
import TopicCommentItem from './TopicCommentItem';
import TopicStartMessage from './TopicStartMessage';
import Context from '../Context';

const { Text } = Typography;

// const CloseModalButton = styled(Button)`
// position:absolute;
// top:20px;
// padding:5px
// right:20px;
// width:44px;
// opacity: 0.7;
// z-index: 1;
// `;

class TopicPage extends React.Component {
  constructor(props) {
    super(props);
    const { location } = this.props;
    const query = new URLSearchParams(location.search);
    this.state = {
      images: [],
      topic: null,
      messages: [],
      page: query.get('page') || 1,
      reply: null,
      answerId: null,
      files: [],
      uploading: false,
      lightboxIsOpen: false,
      error: false,
    };
    this.replyForm = React.createRef();
  }

  componentDidMount() {
    const { page } = this.state;
    this.getTopics(parseInt(page, 10));
  }

  getTopics = async page => {
    // Get a topic and a list of comments for this topic by topic id
    const { match } = this.props;
    try {
      const { topic, commentDto } = await queries.getTopic(match.params.topicId, page - 1, 10);
      const url = 'http://localhost:8888/api/securedPhoto/photoFromAlbum/';
      const data = await queries.getPhotosFromAlbum(topic.photoAlbum.id);
      const images = data.map(image => ({ ...image, src: `${url}${image.id}` }));
      this.setState({
        images,
        topic,
        page,
        messages: commentDto ? commentDto.content : null,
        error: false,
      });
    } catch (error) {
      this.setState({ error: true });
    }
  };

  changePageHandler = page => {
    const { history } = this.props;
    history.push(`${history.location.pathname}?page=${page}`);
    this.getTopics(page);
  };

  replyButtonHandler = () => {
    this.replyForm.focus();
  };

  handleQuoteComment = comment => () => {
    const { isLogin } = this.context;
    if (isLogin) {
      this.replyForm.focus();
      this.setState({
        reply: {
          replyDateTime: comment.commentDateTime,
          replyNick: comment.author.nickName,
          replyText: comment.commentText,
        },
        answerId: comment.commentId,
      });
    } else {
      this.openNotification();
    }
  };

  handleSubmitComment = async (messageText, resetForm) => {
    if (messageText === '') {
      notification.open({
        message: 'Сообщение не может быть пустым',
        description: 'Максимальное количество символов 500000',
        icon: <GoldIcon type="warning" />,
      });
      return;
    }

    this.setState({ uploading: true });
    const { topic, answerId, files } = this.state;
    const { user } = this.context;
    const { history } = this.props;
    const messageComentsEntity = {
      idTopic: topic.id,
      idUser: user.id,
      text: messageText.trim(),
    };

    if (answerId) {
      messageComentsEntity.answerID = answerId;
    }

    [messageComentsEntity.image1, messageComentsEntity.image2] = files;
    try {
      await queries.addComment(messageComentsEntity);
      const lastPage = Math.floor(topic.messageCount / 10 + 1);
      history.push(`${history.location.pathname}?page=${lastPage}`);
      this.getTopics(lastPage);
      message.success('Ваше сообщение успешно добавлено');
      this.setState({ reply: null, answerId: null, files: [], uploading: false });
      resetForm();
    } catch {
      message.error('Похоже, что-то не так. Сообщение добавить не удалось.');
      this.setState({ uploading: false });
    }
  };

  handleDeleteComment = commentId => {
    const { page, messages } = this.state;
    const { history } = this.props;

    if (messages.length === 1 && page === 1) {
      history.push(`${history.location.pathname}?page=${page}`);
      queries
        .deleteComment(commentId)
        .then(() => {
          history.push(`${history.location.pathname}?page=${page}`);
          this.getTopics(page);
          message.success('Сообщение удалено');
        })
        .catch(() => {
          message.error('Похоже, что-то не так. Сообщение удалить не удалось.');
        });
      return;
    }

    if (messages.length === 1 && page > 1) {
      queries
        .deleteComment(commentId)
        .then(() => {
          history.push(`${history.location.pathname}?page=${page - 1}`);
          this.getTopics(page - 1);
          message.success('Сообщение удалено');
        })
        .catch(() => {
          message.error('Похоже, что-то не так. Сообщение удалить не удалось.');
        });
      return;
    }

    queries
      .deleteComment(commentId)
      .then(() => {
        history.push(`${history.location.pathname}?page=${page}`);
        this.getTopics(page);
        message.success('Сообщение удалено');
      })
      .catch(() => {
        message.error('Похоже, что-то не так. Сообщение удалить не удалось.');
      });
  };

  openNotification = () => {
    notification.open({
      message: 'Требуется авторизация',
      description: 'Только зарегистрированные пользователи могут оставлять комментарии.',
      icon: <GoldIcon type="warning" />,
    });
  };

  handleCancelReply = () => {
    this.setState({ reply: null, answerId: null });
  };

  handleAddFile = info => {
    this.setState({ files: info.fileList });
    if (info.file.status !== 'removed') {
      message.success(`Файл ${info.file.name} успешно добавлен`);
    }
  };

  toggleLightbox = () => {
    this.setState(state => ({
      lightboxIsOpen: !state.lightboxIsOpen,
    }));
  };

  render() {
    const { messages, topic, page, reply, files, uploading, error, images } = this.state;
    const { isLogin } = this.context;

    return error ? (
      <Result
        status="403"
        title="403"
        subTitle="Извините, вы не авторизованы для доступа к этой странице."
        extra={
          <Button type="primary">
            <Link to="/login">Авторизироваться</Link>
          </Button>
        }
      />
    ) : (
      <div>
        {topic ? (
          <div>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link to="/">Главная</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link to={`/section/${topic.section.id}`}>{topic.section.name}</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link to={`/subsection/${topic.subsection.id}`}>{topic.subsection.name}</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link to={`/topic/${topic.id}`}>{topic.name}</Link>
              </Breadcrumb.Item>
            </Breadcrumb>
            <TopicStartMessage images={images} topic={topic} toggleLightbox={this.toggleLightbox} />
            <TopicCommentsList
              changePageHandler={this.changePageHandler}
              messages={messages}
              itemComponent={item => (
                <TopicCommentItem
                  comment={item}
                  handleQuoteComment={this.handleQuoteComment}
                  deleteComment={this.handleDeleteComment}
                  getTopics={this.getTopics}
                  page={page}
                />
              )}
              total={topic.messageCount}
              page={page}
              replyButtonHandler={this.replyButtonHandler}
              openNotification={this.openNotification}
            />
          </div>
        ) : (
          <Spin />
        )}
        {reply && (
          <TopicCommentReplyAlert
            type="success"
            closeText="Отменить комментирование"
            onClose={this.handleCancelReply}
            message={
              <>
                <span>
                  Ответ на сообщение пользователя <Text strong>{reply.replyNick}</Text>
                </span>
                <Markup content={reply.replyText} />
              </>
            }
          />
        )}
        <Comment
          avatar={
            <Avatar
              src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
              alt="Han Solo"
            />
          }
          content={
            <TopicReplyForm
              replyRef={element => {
                this.replyForm = element;
              }}
              handleSubmitComment={this.handleSubmitComment}
              handleAddFile={this.handleAddFile}
              files={files}
              uploading={uploading}
            />
          }
        />
        <ReplyFloatButton
          type="primary"
          icon="message"
          onClick={isLogin ? this.replyButtonHandler : this.openNotification}
        >
          Ответить
        </ReplyFloatButton>
      </div>
    );
  }
}

TopicPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.objectOf(PropTypes.string),
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }),
  }).isRequired,
};

TopicPage.contextType = Context;

export default withRouter(TopicPage);
