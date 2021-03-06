import styled from 'styled-components';
import { InputNumber } from 'formik-antd';

export const StyledMenu = styled.div`
  height: fit-content;
  width: 300px;
  box-shadow: 0px 0px 16px -2px rgba(0, 0, 0, 0.2);
`;

export const Column = styled.div`
  display: flex;
  margin-left: 20px;
  width: 100%;
  flex-direction: column;
  justify-content: flex-start;
`;

export const Container = styled.div`
  display: flex;
`;

export const Row = styled.div`
  display: flex;
  justify-content: center;
  .ant-form-item-children {
    display: flex;
  }
`;

export const StyledInput = styled(InputNumber)`
  width: 200px;
  margin: 0 5px 5px 0;
`;

export const StyledDate = styled.span`
  display: block;
`;

export const StyledUserInfo = styled.div`
  text-align: right;
`;

export const StyledTags = styled.div`
  display: flex;
`;

export const StyledMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 5px;
`;

export const StyledArticle = styled.article`
  padding: 32px 24px 24px 24px;
  border-radius: 2px;
  margin-bottom: 24px;
  box-shadow: 0px 0px 16px -2px rgba(0, 0, 0, 0.2);
`;

export const StyledTitle = styled.h1`
  padding: 2px 0;
  font-size: 25px;
  width: 100%;
  border-bottom: 1px solid #1890ff;
  text-align: center;
  margin: 0;
`;

export const StyledCenteredContainer = styled.div`
  display: flex;
  min-height: 500px;
  font-size: 18px;
  justify-content: center;
  align-items: center;
`;

export const StyledHeader = styled.h1`
  text-align: center;
  font-weight: 600;
  font-size: 24px;
`;
