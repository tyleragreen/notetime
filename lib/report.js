class Report {
  constructor(title) {
    this.title = title;

    this.text = '';

    this.addLine(`# ${this.title}`);
  }

  addLine(line) {
    this.text += `${line}\n`;
  }

  getText() {
    return this.text;
  }
}

module.exports = Report;
