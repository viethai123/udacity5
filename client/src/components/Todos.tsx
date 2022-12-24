import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'
import '../Pagination.css'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  loadingTodos: boolean
  currentPage: number
  todosPerPage: number
  currentTodos: any
  pageNumbers: any
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    loadingTodos: true,
    currentPage: 1,
    todosPerPage: 3,
    currentTodos: [],
    pageNumbers: []
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  handleClick = (number: any) => {
    // this.setState({
    //   currentPage: Number(event.target.id)
    // });

    const currentPage = Number(number)


    const { todos, todosPerPage } = this.state;
    // Logic for displaying todos
    const indexOfLastTodo = currentPage * todosPerPage;
    const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
    const currentTodos = todos.slice(indexOfFirstTodo, indexOfLastTodo);
    console.log('currentTodos', currentTodos)
    // Logic for displaying page numbers 
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(this.state.todos.length / this.state.todosPerPage); i++) {
      pageNumbers.push(i);
    }

    this.setState({pageNumbers, currentTodos, currentPage})
  }

  handlePrevClick = () => {
    if (this.state.currentPage === 1) return
    this.setState(prevPage => {
      return {currentPage: prevPage.currentPage - 1}
    })
  }

  handleNextClick = () => {
    if (this.state.currentPage === this.state.pageNumbers) return
    this.setState(prevPage => {
      return {currentPage: prevPage.currentPage + 1}
    })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.newTodoName,
        dueDate
      })
      this.setState({
        todos: [...this.state.todos, newTodo],
        newTodoName: ''
      })
    } catch (err: any) {
      console.log('error', err)
      alert('Todo creation failed')
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.todoId !== todoId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingTodos: false
      })
  
      const { todos: listTodos, todosPerPage } = this.state;
      // Logic for displaying todos
      const indexOfLastTodo = 1 * todosPerPage;
      const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
      const currentTodos = listTodos.slice(indexOfFirstTodo, indexOfLastTodo);
      console.log('currentTodos', currentTodos)
      // Logic for displaying page numbers 
      const pageNumbers = [];
      for (let i = 1; i <= Math.ceil(this.state.todos.length / this.state.todosPerPage); i++) {
        pageNumbers.push(i);
      }

      this.setState({pageNumbers, currentTodos})

    } catch (e:any) {
      alert(`Failed to fetch todos: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">My todos list</Header>

        {this.renderCreateTodoInput()}
        {this.renderTodos(this.state.currentTodos)}
        {/* {this.renderTodos()} */}
        <div className="pagination">
          <div onClick={() => this.handlePrevClick()}>&laquo;</div>
          {this.state.pageNumbers.map((number: any) => {
            return (
              <>
                {/* <li
                  key={number}
                  id={number as any}
                  onClick={this.handleClick}
                >
                  {number}
                </li> */}
                <div className={Number(this.state.currentPage) === Number(number) ? 'active' : ''} onClick={() => this.handleClick(number)}>{number}</div>
              </>
            );
          })}
          <div onClick={() => this.handleNextClick()}>&raquo;</div>
        </div>
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onTodoCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos(listItem: any) {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList(listItem)
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList(listItem: any) {
    return (
      <Grid padded>
        {listItem.map((todo: any, pos: any) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTodoCheck(pos)}
                  checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(todo.todoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
