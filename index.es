import React, { Component } from 'react'
import { Checkbox, ControlLabel, FormControl } from 'react-bootstrap'
import { observe, observer } from 'redux-observers'
import { connect } from 'react-redux'
import fs from 'fs'
import { get } from 'lodash'
import PropTypes from 'prop-types'

import { store } from 'views/create-store'
import { constSelector } from 'views/utils/selectors'

class Exporter {
  constructor() {
  }
  exportData = async (data) => {
    const path = config.get('plugin.exporter.path', 'data.json')
    fs.writeFile(path, JSON.stringify(data))
  }
}

const exporter = new Exporter()

const unsubscribeObserver = observe(store, [
  observer(
    state => constSelector(state),
    (dispatch, current, previous) => {
      exporter.exportData(current)
    }
  )]
)

const TextLabelConfig = connect(() => {
  return (state, props) => ({
    value: get(state.config, props.configName, props.defaultVal),
    configName: props.configName,
    label: props.label,
  })
})(class textLabelConfig extends Component {
  static propTypes = {
    label: PropTypes.string,
    configName: PropTypes.string,
    value: PropTypes.string,
  }
  handleChange = (e) => {
    config.set(this.props.configName, e.target.value)
  }
  render() {
    return (
      <div>
        <ControlLabel>{this.props.label}</ControlLabel>
        <FormControl
          type="text"
          defaultValue={this.props.value}
          onBlur={this.handleChange}
          />
      </div>
    )
  }
})

// TODO: il8n
export const settingsClass = () =>
  <div>
    <TextLabelConfig
      label="Location to save data to"
      configName="plugin.exporter.path"
      defaultVal="data.json"
    />
  </div>

export function pluginDidLoad() {
  const constData = constSelector(window.getStore())
  exporter.exportData(constData)
}

export function pluginWillUnload() {
  unsubscribeObserver()
}
