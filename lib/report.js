class Report {
  constructor(title) {
    this.title = title;

    this.text = '';

    this.addLine(`# ${this.title}`);
  }

  addLine(line) {
    if (line) {
      this.text += `${line}\n`;
    } else {
      this.text += '\n';
    }
  }

  getText() {
    return this.text;
  }
}

module.exports = Report;
